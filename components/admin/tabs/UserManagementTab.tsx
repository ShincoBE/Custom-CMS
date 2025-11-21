import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Users, Spinner, Trash } from 'phosphor-react';
import AdminInput from '../ui/AdminInput';
import type { User, UserRole } from '../../../types';

interface UserManagementTabProps {
    showNotification: (type: 'success' | 'error', message: string) => void;
    showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

const UserManagementTab = ({ showNotification, showConfirmation }: UserManagementTabProps) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Editor' as UserRole });

    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error("Kon gebruikers niet laden.");
            const data = await res.json();
            setUsers(data.users);
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newUser.username.length < 3 || newUser.password.length < 8) {
            showNotification('error', 'Gebruikersnaam > 2 tekens en wachtwoord > 7 tekens.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification('success', data.message);
            setNewUser({ username: '', password: '', role: 'Editor' });
            fetchUsers();
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteUser = (username: string) => {
        showConfirmation(
            'Gebruiker Verwijderen',
            `Weet u zeker dat u '${username}' wilt verwijderen?`,
            async () => {
                try {
                    const res = await fetch('/api/users/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    showNotification('success', data.message);
                    fetchUsers();
                } catch (error: any) {
                    showNotification('error', error.message);
                }
            }
        );
    }

    const handleRoleChange = async (username: string, role: UserRole) => {
        try {
            const res = await fetch('/api/users/update-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification('success', data.message);
            fetchUsers();
        } catch (error: any) {
            showNotification('error', error.message);
        }
    }

    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100 flex items-center"><Users size={28} className="mr-3 text-green-500" />Gebruikersbeheer</h2>
            
            <div className="mb-8 p-4 border border-zinc-700 rounded-lg bg-zinc-800/50">
                <h3 className="text-lg font-semibold mb-3 text-white">Nieuwe Gebruiker Toevoegen</h3>
                <form onSubmit={handleCreateUser} className="flex flex-col gap-4 lg:grid lg:grid-cols-4 lg:items-end">
                    <AdminInput name="username" label="Gebruikersnaam" value={newUser.username} onChange={handleNewUserChange} required autoComplete="off" />
                    <AdminInput name="password" label="Wachtwoord" type="password" value={newUser.password} onChange={handleNewUserChange} required autoComplete="new-password" />
                    <div className="mb-6 lg:mb-0">
                        <label htmlFor="role" className="block text-sm font-medium text-zinc-300 mb-1">Rol</label>
                        <select id="role" name="role" value={newUser.role} onChange={handleNewUserChange} className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:ring-green-500 focus:border-green-500 h-[42px]">
                            <option value="Editor">Editor</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="mb-6 lg:mb-0">
                        <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 h-[42px]">
                           {isSubmitting ? <Spinner size={20} className="animate-spin" /> : 'Aanmaken'}
                        </button>
                    </div>
                </form>
            </div>

            <div>
                 <h3 className="text-lg font-semibold mb-3 text-white">Huidige Gebruikers</h3>
                 {isLoadingUsers ? <Spinner size={24} className="animate-spin" /> : (
                    <div className="border border-zinc-700 rounded-lg overflow-hidden">
                        <ul className="divide-y divide-zinc-700">
                            {users.map(user => (
                                <li key={user.username} className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-zinc-800/50">
                                    <div className="flex flex-col">
                                        <span className="text-zinc-200 font-medium">{user.username}</span>
                                        <span className="text-xs text-zinc-400">{user.role}</span>
                                    </div>
                                    {user.username === currentUser?.username ? (
                                        <span className="text-xs text-zinc-400 italic self-start sm:self-auto">Dit bent u</span>
                                    ) : (
                                      <div className="flex items-center space-x-3 self-end sm:self-auto">
                                        <select 
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user.username, e.target.value as UserRole)}
                                            className="bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-xs text-zinc-300"
                                            disabled={user.role === 'SuperAdmin'}
                                        >
                                            <option value="Editor">Editor</option>
                                            <option value="Admin">Admin</option>
                                            {user.role === 'SuperAdmin' && <option value="SuperAdmin">SuperAdmin</option>}
                                        </select>
                                        <button onClick={() => handleDeleteUser(user.username)} className="p-1 text-zinc-400 hover:text-red-400" aria-label={`Verwijder ${user.username}`}>
                                            <Trash size={20} />
                                        </button>
                                      </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}
            </div>
        </>
    );
};

export default UserManagementTab;