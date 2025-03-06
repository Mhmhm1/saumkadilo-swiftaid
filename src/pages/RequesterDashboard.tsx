
import React from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const RequesterDashboard = () => {
  const { currentUser, isRequester } = useAuth();
  
  // Redirect if not requester
  if (!currentUser || !isRequester) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-6 bg-gradient-to-b from-white/0 to-gray-50/80 dark:from-transparent dark:to-gray-900/20">
        <div className="container mx-auto px-4 mb-6">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Welcome, {currentUser.name}</h1>
                <p className="text-muted-foreground mt-1">Need emergency assistance?</p>
              </div>
              <Button asChild className="mt-4 sm:mt-0 bg-emergency hover:bg-emergency/90">
                <Link to="/request" className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Request Emergency Help
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <Dashboard userRole="requester" userId={currentUser.id} />
      </main>
    </div>
  );
};

export default RequesterDashboard;
