
import React from 'react';
import AuthForm from '@/components/AuthForm';
import Header from '@/components/Header';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white/0 to-gray-50/80 dark:from-transparent dark:to-gray-900/20">
        <AuthForm mode="register" />
      </main>
    </div>
  );
};

export default Register;
