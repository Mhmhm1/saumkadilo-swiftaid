
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { addEmergencyRequest } from '@/utils/mockData';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EmergencyRequestForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [emergencyType, setEmergencyType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

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
        patientName,
        patientAge,
        patientGender,
        emergencyType,
        additionalInfo,
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
    <Card className="glass-card animate-scale max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Emergency Request</CardTitle>
        <CardDescription className="text-center">
          Provide details about your emergency for swift assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                placeholder="Name of the patient"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="glass-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientAge">Patient Age</Label>
              <Input
                id="patientAge"
                placeholder="Age"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientGender">Patient Gender</Label>
              <Select
                value={patientGender}
                onValueChange={setPatientGender}
              >
                <SelectTrigger id="patientGender" className="glass-input">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyType">Emergency Type</Label>
              <Select
                value={emergencyType}
                onValueChange={setEmergencyType}
              >
                <SelectTrigger id="emergencyType" className="glass-input">
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="injury">Injury</SelectItem>
                  <SelectItem value="unconscious">Unconscious Person</SelectItem>
                  <SelectItem value="breathing">Breathing Difficulty</SelectItem>
                  <SelectItem value="childbirth">Childbirth</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
              rows={3}
              className="glass-input resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              placeholder="Any other important details that might help responders (allergies, medical history, etc.)"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={2}
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
