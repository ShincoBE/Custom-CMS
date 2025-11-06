import React, { useState, useEffect, useRef } from 'react';
import { Gear } from 'phosphor-react';

interface AdminTab {
    id: string;
    label: string;
}

interface AdminDropdownMenuProps {
    adminTabs: AdminTab[];
    setActiveTab: (tabId: string) => void;
    isAdminTabActive: boolean;
}

const AdminDropdownMenu = ({ adminTabs, setActiveTab, isAdminTabActive }: AdminDropdownMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="Admin instellingen"
                className={`p-2 rounded-full transition-colors ${
                    isAdminTabActive
                        ? 'bg-green-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
            >
                <Gear size={20} />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg z-20 py-1 animate-fade-in">
                    {adminTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDropdownMenu;
