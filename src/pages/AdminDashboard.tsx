
import React from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  
  // Redirect if not admin
  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-6 bg-gradient-to-b from-white/0 to-gray-50/80 dark:from-transparent dark:to-gray-900/20">
        <Dashboard userRole="admin" userId={currentUser.id} />
      </main>
    </div>
  );
};

export default AdminDashboard;
