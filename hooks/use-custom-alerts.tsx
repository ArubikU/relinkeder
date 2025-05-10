import { X } from 'lucide-react';
import { createContext, ReactNode, useContext, useState } from 'react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface Alert {
    id: number;
    type: AlertType;
    message: string;
}

type AlertContextType = {
    alert: (message: string) => void;
    confirm: (message: string) => Promise<boolean>;
    either: (message: string, options: string[]) => Promise<string>;
    alerts: Alert[];
    removeAlert: (id: number) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

let alertId = 0;

export const CustomAlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [modal, setModal] = useState<ReactNode | null>(null);

    const alert = (message: string) => {
        const id = ++alertId;
        setAlerts((prev) => [...prev, { id, type: 'info', message }]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            removeAlert(id);
        }, 3000);
    };

    const removeAlert = (id: number) => {
        setAlerts((prev) => prev.filter(a => a.id !== id));
    };

    const confirm = (message: string) => {
        return new Promise<boolean>((resolve) => {
            console.log('Confirm called');
            setModal(
                <div className="modal-overlay">
                    <div className="modal">
                        <div>{message}</div>
                        <button onClick={() => { setModal(null); resolve(true); }}>OK</button>
                        <button onClick={() => { setModal(null); resolve(false); }}>Cancel</button>
                    </div>
                </div>
            );

        });
    };

    const either = (message: string, options: string[]) => {
        return new Promise<string>((resolve) => {
            setModal(
                <div className="modal-overlay">
                    <div className="modal">
                        <div>{message}</div>
                        {options.map(opt => (
                            <button key={opt} onClick={() => { setModal(null); resolve(opt); }}>{opt}</button>
                        ))}
                    </div>
                </div>
            );
        });
    };

    return (
        <AlertContext.Provider value={{ alert, confirm, either, alerts, removeAlert }}>
            {children}

            {/* Overlay de alertas */}
            <div className="alerts">
                {alerts.map(a => (
                    <div key={a.id} className={`alert alert-${a.type}`}>
                        {a.message}
                        <button onClick={() => removeAlert(a.id)}>
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal centrado */}
            {modal}
        </AlertContext.Provider>
    );

};

export const useCustomAlerts = () => {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error('useCustomAlerts must be used within CustomAlertProvider');
    return ctx;
};