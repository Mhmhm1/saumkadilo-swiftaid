
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SyncStatus = () => {
  const { syncEnabled, toggleSync, loading } = useAuth();

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={syncEnabled ? "success" : "secondary"} className="flex items-center gap-1">
        {syncEnabled ? (
          <>
            <Cloud className="h-3 w-3" />
            <span>Syncing</span>
          </>
        ) : (
          <>
            <CloudOff className="h-3 w-3" />
            <span>Local Only</span>
          </>
        )}
      </Badge>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={toggleSync} 
        disabled={loading}
        title={syncEnabled ? "Disable cloud sync" : "Enable cloud sync"}
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default SyncStatus;
