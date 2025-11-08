import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import ServicePage from './pages/ServicePage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/diensten/:slug" element={<ServicePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>aimport React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import ServicePage from './pages/ServicePage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/diensten/:slug" element={<ServicePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Analytics />
    </>
  );
}

export default App;
      <Analytics />
    </>
  );
}

export default App;