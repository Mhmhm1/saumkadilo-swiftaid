
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/context/AuthContext';
import { addEmergencyRequest } from '@/utils/mockData';
import { AlertTriangle, MapPin, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const EmergencyRequestForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

  // Get current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingLocation(false);
        
        // For demo, also set a fake address based on coordinates
        // In a real app, you would use reverse geocoding here
        setAddress('123 Current Location St.');
        
        toast.success('Location detected successfully');
      },
      (error) => {
        console.error('Error getting location:', error);
        setGettingLocation(false);
        toast.error('Failed to get your location. Please enter your address manually.');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('You must be logged in to make an emergency request');
      return;
    }
    
    if (!address || !description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!coordinates) {
      // For demo purposes, generate random coordinates near San Francisco
      const baseLatSF = 37.7749;
      const baseLngSF = -122.4194;
      const randomLat = baseLatSF + (Math.random() * 0.02 - 0.01);
      const randomLng = baseLngSF + (Math.random() * 0.02 - 0.01);
      
      setCoordinates({
        lat: randomLat,
        lng: randomLng
      });
    }
    
    setLoading(true);
    
    try {
      // Simulate a delay for the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const locationData = {
        address,
        coordinates: coordinates || { lat: 37.7749, lng: -122.4194 } // Default to SF if not set
      };
      
      // Add request to mock data
      addEmergencyRequest(
        currentUser.id,
        currentUser.name,
        locationData,
        description,
        currentUser.phone
      );
      
      toast.success('Emergency request submitted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit emergency request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card animate-scale max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Emergency Request</CardTitle>
        <CardDescription className="text-center">
          Provide details about your emergency for swift assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4 border-emergency/30 bg-emergency/10 text-emergency-foreground">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            If this is a life-threatening emergency, please also call 911 immediately.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Your Location</Label>
            <div className="flex space-x-2">
              <Input
                id="location"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="glass-input"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="shrink-0"
              >
                {gettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Emergency Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your emergency in detail (symptoms, injuries, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="glass-input resize-none"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          className="w-full bg-emergency hover:bg-emergency/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Request...
            </>
          ) : (
            'Submit Emergency Request'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmergencyRequestForm;
