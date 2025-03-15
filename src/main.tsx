
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'

import { AuthProvider } from './context/AuthContext';
import { migrateUsersToSupabase } from './utils/migrationUtils';

import Index from './pages/Index.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import RequesterDashboard from './pages/RequesterDashboard.tsx'
import DriverDashboard from './pages/DriverDashboard.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import RequestEmergency from './pages/RequestEmergency.tsx'
import NotFound from './pages/NotFound.tsx'

const queryClient = new QueryClient()

// Trigger migration of mock users to Supabase
migrateUsersToSupabase().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Index />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="requester-dashboard" element={<RequesterDashboard />} />
              <Route path="driver-dashboard" element={<DriverDashboard />} />
              <Route path="admin-dashboard" element={<AdminDashboard />} />
              <Route path="request-emergency" element={<RequestEmergency />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
