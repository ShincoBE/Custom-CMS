import React from 'react';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <header className="bg-zinc-800 border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-zinc-700 rounded-lg h-96 p-8 text-center flex flex-col justify-center">
              <h2 className="text-2xl font-semibold text-zinc-300">Welcome to your CMS!</h2>
              <p className="mt-2 text-zinc-400">
                This is where you will manage your website's content. <br />
                Content editing features will be added here soon.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
