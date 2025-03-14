
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { Bell, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';

const NotificationSettings: React.FC = () => {
  const { currentUser, updateUserProfile, toggleSmsNotifications } = useAuth();
  const [phoneNumber, setPhoneNumber] = React.useState(currentUser?.phone || '');
  
  if (!currentUser) return null;
  
  const handlePhoneUpdate = () => {
    // Basic phone validation
    if (phoneNumber && !/^\+?\d{10,15}$/.test(phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    updateUserProfile({ phone: phoneNumber });
    toast.success('Phone number updated');
  };
  
  const handleToggleSms = (checked: boolean) => {
    if (checked && !currentUser.phone) {
      toast.error('Please add a phone number first');
      return;
    }
    
    toggleSmsNotifications(checked);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you want to be notified about important events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important alerts via SMS when you're offline
              </p>
            </div>
            <Switch
              checked={currentUser.sms_notifications || false}
              onCheckedChange={handleToggleSms}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base flex items-center gap-1">
              <Phone className="h-4 w-4" /> Phone Number
            </Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                placeholder="+12345678900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button onClick={handlePhoneUpdate}>Update</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Required for SMS notifications
            </p>
          </div>
        </div>
        
        {currentUser.role === 'driver' && (
          <div className="pt-4 border-t">
            <h3 className="text-base font-medium mb-2">Driver-specific Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="new-requests" checked={true} disabled />
                <Label htmlFor="new-requests">Emergency request alerts</Label>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                These notifications cannot be disabled for safety reasons
              </p>
            </div>
          </div>
        )}
        
        {currentUser.role === 'requester' && (
          <div className="pt-4 border-t">
            <h3 className="text-base font-medium mb-2">Requester-specific Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="driver-assigned" checked={true} disabled />
                <Label htmlFor="driver-assigned">Driver assignment updates</Label>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                These notifications cannot be disabled for safety reasons
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
