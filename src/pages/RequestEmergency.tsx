
import React from 'react';
import Header from '@/components/Header';
import EmergencyRequestForm from '@/components/EmergencyRequestForm';

const RequestEmergency = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white/0 to-gray-50/80 dark:from-transparent dark:to-gray-900/20">
        <EmergencyRequestForm />
      </main>
    </div>
  );
};

export default RequestEmergency;
