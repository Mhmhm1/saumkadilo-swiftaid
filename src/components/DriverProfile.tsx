
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/context/AuthContext';
import { User, MapPin, Truck, BadgeCheck, UserRound, Camera } from 'lucide-react';
import { toast } from 'sonner';

const DriverProfile = () => {
  const { currentUser, updateDriverStatus, updateUserProfile } = useAuth();
  
  const [status, setStatus] = useState<'available' | 'busy' | 'offline'>(currentUser?.status || 'available');
  const [location, setLocation] = useState(currentUser?.currentLocation || '');
  const [currentJob, setCurrentJob] = useState(currentUser?.currentJob || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!currentUser) return null;

  const handleStatusUpdate = () => {
    updateDriverStatus(status, location, status === 'busy' ? currentJob : undefined);
  };

  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    
    // Create a URL for the image
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoUrl = e.target?.result as string;
      updateUserProfile({ photoUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Driver Profile</CardTitle>
        <CardDescription>
          Your details and current status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 cursor-pointer" onClick={handleProfilePictureClick}>
              <AvatarImage src={currentUser.photoUrl} alt={currentUser.name} />
              <AvatarFallback className="text-2xl bg-primary/10">
                <UserRound className="h-10 w-10 text-primary" />
              </AvatarFallback>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </Avatar>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <h3 className="text-xl font-semibold">{currentUser.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                status === 'available' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : status === 'busy'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <BadgeCheck className="mr-1 h-4 w-4" />
                Driver ID: {currentUser.driverId}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Truck className="mr-1 h-4 w-4" />
                Ambulance: {currentUser.ambulanceId}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-1 h-4 w-4" />
                License: {currentUser.licenseNumber}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {currentUser.currentLocation || 'No location set'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-4">Update your status</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Availability</Label>
              <Select value={status} onValueChange={(value: 'available' | 'busy' | 'offline') => setStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Set your status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Current Location</Label>
              <Input
                id="location"
                placeholder="Where are you now?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          {status === 'busy' && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="currentJob">Current Job</Label>
              <Input
                id="currentJob"
                placeholder="What are you doing now?"
                value={currentJob}
                onChange={(e) => setCurrentJob(e.target.value)}
              />
            </div>
          )}
          
          <Button 
            className="mt-4"
            onClick={handleStatusUpdate}
          >
            Update Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverProfile;
