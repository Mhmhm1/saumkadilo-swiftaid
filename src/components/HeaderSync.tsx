
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import SyncStatus from './SyncStatus';

const HeaderSync = () => {
  const { currentUser } = useAuth();

  // Only show sync status if user is logged in
  if (!currentUser) return null;

  return <SyncStatus />;
};

export default HeaderSync;
