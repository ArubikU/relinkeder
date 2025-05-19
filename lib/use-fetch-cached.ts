import { useCallback, useEffect, useState } from "react";

// --- MemoryCache implementation (as you provided) ---
type CacheItem<T> = {
    data: T;
    expiry: number;
};

class MemoryCache {
    private cache: Map<string, CacheItem<any>> = new Map();
    private isBrowser = typeof window !== 'undefined';
    private prefix = 'cache:';

    private getFromLocalStorage<T>(key: string): CacheItem<T> | null {
        if (!this.isBrowser) return null;
        try {
            const itemStr = localStorage.getItem(this.prefix + key);
            if (!itemStr) return null;
            const item = JSON.parse(itemStr) as CacheItem<T>;
            if (Date.now() > item.expiry) {
                localStorage.removeItem(this.prefix + key);
                return null;
            }
            return item;
        } catch {
            return null;
        }
    }

    private saveToLocalStorage<T>(key: string, item: CacheItem<T>): void {
        if (!this.isBrowser) return;
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(item));
        } catch {}
    }

    private removeFromLocalStorage(key: string): void {
        if (this.isBrowser) {
            localStorage.removeItem(this.prefix + key);
        }
    }

    get<T>(key: string): T | null {
        const memoryItem = this.cache.get(key);
        if (memoryItem) {
            if (Date.now() > memoryItem.expiry) {
                this.cache.delete(key);
                this.removeFromLocalStorage(key);
                return null;
            }
            return memoryItem.data as T;
        }
        const localItem = this.getFromLocalStorage<T>(key);
        if (localItem) {
            this.cache.set(key, localItem);
            return localItem.data;
        }
        return null;
    }

    set<T>(key: string, data: T, ttl: number = 300): void {
        const expiry = Date.now() + ttl * 1000;
        const item: CacheItem<T> = { data, expiry };
        this.cache.set(key, item);
        this.saveToLocalStorage(key, item);
    }

    delete(key: string): void {
        this.cache.delete(key);
        this.removeFromLocalStorage(key);
    }

    override<T>(url: string, dispatcher: React.Dispatch<T> | T): void {
        const keysToOverride: string[] = [];
        for (const key of this.cache.keys()) {
            if (key.startsWith(url)) {
                keysToOverride.push(key);
            }
        }
        for (const key of keysToOverride) {
            const item = this.cache.get(key);
            if (item) {
                let modifiedItemResult = item;
                if (item.data && (item.data as any).result) {
                    if (typeof dispatcher === 'function') {
                        modifiedItemResult.data.result = (dispatcher as React.Dispatch<T>)(item.data.result);
                    } else {
                        modifiedItemResult.data.result = dispatcher;
                    }
                    this.set(key, modifiedItemResult.data, (item.expiry - Date.now()) / 1000);
                }
            }
        }
    }
}

export const apiCache = new MemoryCache();

// --- useFetchCached hook ---
type UseFetchCachedReturn<T> = {
    value: T | undefined;
    setValue: (val: T, ttl?: number) => void;
    cleanValue: () => void;
    overrideValue: (dispatcher: React.Dispatch<T> | T) => void;
};

export function useFetchCached<T>(
    key: string,
    promiseFn: () => Promise<T>,
    ttl: number = 300 // default TTL in seconds
): UseFetchCachedReturn<T> {
    const [value, setValueState] = useState<T | undefined>(() => apiCache.get<T>(key) ?? undefined);

    // Set value and cache it
    const setValue = useCallback(
        (val: T, customTtl?: number) => {
            setValueState(val);
            apiCache.set(key, val, customTtl ?? ttl);
        },
        [key, ttl]
    );

    // Remove value from cache and state
    const cleanValue = useCallback(() => {
        setValueState(undefined);
        apiCache.delete(key);
    }, [key]);

    // Override value in cache and update state if affected
    const overrideValue = useCallback(
        (dispatcher: React.Dispatch<T> | T) => {
            apiCache.override<T>(key, dispatcher);
            const newValue = apiCache.get<T>(key) ?? undefined;
            setValueState(newValue);
        },
        [key]
    );

    // Fetch and cache if not present
    useEffect(() => {
        if (value === undefined && promiseFn) {
            promiseFn().then((result) => {
                setValue(result);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { value, setValue, cleanValue, overrideValue };
}