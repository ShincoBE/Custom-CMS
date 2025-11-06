import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/admin"
        element={
          <>
            <SignedOut>
              <SignInPage />
            </SignedOut>
            <SignedIn>
              <AdminDashboard />
            </SignedIn>
          </>
        }
      />
       <Route 
        path="/sign-in/*"
        element={<SignInPage />}
      />
       <Route 
        path="/sign-up/*"
        element={<SignUpPage />}
      />
      <Route 
        path="/admin/dashboard"
        element={
          <SignedIn>
            <AdminDashboard />
          </SignedIn>
        } 
      />
    </Routes>
  );
}

export default App;