
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'

import { AuthProvider } from './context/AuthContext';
import { migrateUsersToSupabase } from './utils/migrationUtils';

// Create a client
const queryClient = new QueryClient()

// Trigger migration of mock users to Supabase
migrateUsersToSupabase().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
