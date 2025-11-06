import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Users, Spinner, Trash } from 'phosphor-react';
import AdminInput from '../ui/AdminInput';

interface UserManagementTabProps {
    showNotification: (type: 'success' | 'error', message: string) => void;
}

const UserManagementTab = ({ showNotification }: UserManagementTabProps) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<string[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '' });

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

    const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUser(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newUser.username.length < 3 || newUser.password.length < 8) {
            showNotification('error', 'Gebruikersnaam moet > 2 tekens zijn en wachtwoord > 7 tekens.');
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
            setNewUser({ username: '', password: '' }); // Reset form
            fetchUsers(); // Refresh user list
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteUser = async (username: string) => {
        if (!window.confirm(`Weet je zeker dat je de gebruiker '${username}' wilt verwijderen?`)) {
            return;
        }
        setIsSubmitting(true);
         try {
            const res = await fetch('/api/users/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification('success', data.message);
            fetchUsers(); // Refresh user list
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-zinc-100 flex items-center"><Users size={28} className="mr-3 text-green-500" />Gebruikersbeheer</h2>
            
            <div className="mb-8 p-4 border border-zinc-700 rounded-lg bg-zinc-800/50">
                <h3 className="text-lg font-semibold mb-3 text-white">Nieuwe Gebruiker Toevoegen</h3>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <AdminInput name="username" label="Gebruikersnaam" value={newUser.username} onChange={handleNewUserChange} required autoComplete="off" />
                    <AdminInput name="password" label="Wachtwoord" type="password" value={newUser.password} onChange={handleNewUserChange} required autoComplete="new-password" />
                    <button type="submit" disabled={isSubmitting} className="w-full md:w-auto self-end mb-6 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-zinc-600">
                       {isSubmitting ? <Spinner size={20} className="animate-spin" /> : 'Gebruiker Aanmaken'}
                    </button>
                </form>
            </div>

            <div>
                 <h3 className="text-lg font-semibold mb-3 text-white">Huidige Gebruikers</h3>
                 {isLoadingUsers ? <Spinner size={24} className="animate-spin" /> : (
                    <ul className="space-y-2">
                        {users.map(username => (
                            <li key={username} className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-md">
                                <span className="text-zinc-200">{username}</span>
                                {username === currentUser?.username ? (
                                    <span className="text-xs text-zinc-400 italic">Huidige gebruiker</span>
                                ) : (
                                    <button
                                        onClick={() => handleDeleteUser(username)}
                                        disabled={isSubmitting}
                                        className="text-zinc-400 hover:text-red-400 disabled:opacity-50"
                                        aria-label={`Verwijder ${username}`}
                                     >
                                        <Trash size={20} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                 )}
            </div>
        </>
    );
};

export default UserManagementTab;
