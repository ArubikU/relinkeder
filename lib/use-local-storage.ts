import { useEffect, useState } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
    const readValue = (): T => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(readValue);

    useEffect(() => {
        setStoredValue(readValue());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch {
            // Ignore write errors
        }
    };

    return [storedValue, setValue] as const;
}

export default useLocalStorage;