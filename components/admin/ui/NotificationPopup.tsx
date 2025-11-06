import React from 'react';
import { CheckCircle, WarningCircle } from 'phosphor-react';

interface NotificationPopupProps {
    notification: {
        type: 'success' | 'error';
        message: string;
    } | null;
}

const NotificationPopup = ({ notification }: NotificationPopupProps) => {
    if (!notification) return null;

    return (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-lg flex items-center text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {notification.type === 'success' ? <CheckCircle size={24} className="mr-3" /> : <WarningCircle size={24} className="mr-3" />}
            <span className="text-sm font-medium">{notification.message}</span>
        </div>
    );
};

export default NotificationPopup;
