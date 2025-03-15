
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { mockRequests } from '@/utils/mockData';
import { setupNotificationListener } from '@/utils/notificationUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  
  useEffect(() => {
    // Log the number of requests to help debug
    console.log('Total mock requests available:', mockRequests.length);
    console.log('Pending requests:', mockRequests.filter(req => req.status === 'pending').length);
    
    // Setup notification listener for the admin user
    if (currentUser) {
      const cleanup = setupNotificationListener(currentUser.id);
      
      // Setup listener for new emergency requests
      const requestsChannel = supabase
        .channel('emergency-requests')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'emergency_requests'
          },
          (payload) => {
            const request = payload.new;
            // Show notification for new emergency request
            toast.warning('New Emergency Request', {
              description: `New emergency request from ${request.user_name}`,
            });
          }
        )
        .subscribe();
      
      return () => {
        cleanup();
        supabase.removeChannel(requestsChannel);
      };
    }
  }, [currentUser]);
  
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
