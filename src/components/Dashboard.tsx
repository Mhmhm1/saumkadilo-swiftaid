
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmergencyRequest, mockRequests, mockDrivers, assignDriver, updateRequestStatus } from '@/utils/mockData';
import RequestCard from './RequestCard';
import Map from './Map';
import { AlertTriangle, Ambulance, Clock, CheckCircle, User } from 'lucide-react';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardProps {
  userRole: 'admin' | 'driver' | 'requester';
  userId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, userId }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  
  // Filter requests based on user role
  const getFilteredRequests = () => {
    if (userRole === 'admin') {
      switch (activeTab) {
        case 'pending':
          return mockRequests.filter(req => req.status === 'pending');
        case 'assigned':
          return mockRequests.filter(req => req.status === 'assigned');
        case 'in-progress':
          return mockRequests.filter(req => req.status === 'in-progress');
        case 'completed':
          return mockRequests.filter(req => req.status === 'completed');
        default:
          return mockRequests;
      }
    } else if (userRole === 'driver') {
      // For drivers, show only their assigned requests
      return mockRequests.filter(req => req.assignedTo === userId);
    } else {
      // For requesters, show only their own requests
      return mockRequests.filter(req => req.userId === userId);
    }
  };
  
  const filteredRequests = getFilteredRequests();
  
  // Get available drivers (for admin)
  const availableDrivers = mockDrivers.filter(driver => driver.status === 'available');
  
  // Handle assigning driver to request
  const handleOpenAssignDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setSelectedDriverId(availableDrivers.length > 0 ? availableDrivers[0].id : null);
    setAssignDialogOpen(true);
  };
  
  const handleAssignDriver = () => {
    if (selectedRequestId && selectedDriverId) {
      assignDriver(selectedRequestId, selectedDriverId);
      setAssignDialogOpen(false);
      toast.success('Ambulance assigned successfully');
    } else {
      toast.error('Please select a driver');
    }
  };
  
  // Handle driver actions
  const handleStartResponse = (requestId: string) => {
    updateRequestStatus(requestId, 'in-progress', 'Driver has arrived at the location');
    toast.success('Response started. Status updated to In Progress');
  };
  
  const handleCompleteRequest = (requestId: string) => {
    updateRequestStatus(requestId, 'completed', 'Request completed by driver');
    toast.success('Request marked as completed');
  };
  
  // Get stats for dashboard
  const getStats = () => {
    const pendingCount = mockRequests.filter(req => req.status === 'pending').length;
    const assignedCount = mockRequests.filter(req => req.status === 'assigned').length;
    const inProgressCount = mockRequests.filter(req => req.status === 'in-progress').length;
    const completedCount = mockRequests.filter(req => req.status === 'completed').length;
    
    return { pendingCount, assignedCount, inProgressCount, completedCount };
  };
  
  const stats = getStats();
  
  // Create map markers from requests and drivers
  const getMapMarkers = () => {
    const markers = [];
    
    // Add markers for emergency requests
    for (const request of filteredRequests) {
      if (request.location?.coordinates) {
        markers.push({
          position: request.location.coordinates,
          title: request.description,
          type: 'emergency'
        });
      }
    }
    
    // Add markers for drivers
    for (const driver of mockDrivers) {
      if (driver.location?.coordinates) {
        markers.push({
          position: driver.location.coordinates,
          title: driver.name,
          type: 'ambulance'
        });
      }
    }
    
    return markers;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Stats */}
      {userRole === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold">{stats.pendingCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                  <h3 className="text-2xl font-bold">{stats.assignedCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-info/20 flex items-center justify-center">
                  <Ambulance className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <h3 className="text-2xl font-bold">{stats.inProgressCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <h3 className="text-2xl font-bold">{stats.completedCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Map */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Location Tracking</CardTitle>
          <CardDescription>
            {userRole === 'admin' 
              ? 'Real-time view of all emergencies and ambulances' 
              : userRole === 'driver'
                ? 'View your assigned emergencies'
                : 'Track your ambulance location'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Map 
            markers={getMapMarkers()}
            height="300px"
          />
        </CardContent>
      </Card>
      
      {/* Emergency requests */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Emergency Requests</CardTitle>
          <CardDescription>
            {userRole === 'admin' 
              ? 'Manage and view all emergency requests' 
              : userRole === 'driver'
                ? 'Your assigned emergencies'
                : 'Your emergency requests'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userRole === 'admin' && (
            <Tabs defaultValue="all" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending <Badge className="ml-2 bg-warning/20 text-warning-foreground">{stats.pendingCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          {filteredRequests.length === 0 ? (
            <div className="text-center p-6">
              <User className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No requests found</h3>
              <p className="text-muted-foreground mt-2">
                {userRole === 'admin' 
                  ? 'There are no emergency requests in this category.' 
                  : userRole === 'driver'
                    ? 'You have no assigned emergencies at the moment.'
                    : 'You have not made any emergency requests yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isAdmin={userRole === 'admin'}
                  isDriver={userRole === 'driver'}
                  onAssign={handleOpenAssignDialog}
                  onStartResponse={handleStartResponse}
                  onComplete={handleCompleteRequest}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Assign driver dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ambulance</DialogTitle>
            <DialogDescription>
              Select a driver to assign to this emergency request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Emergency Details</h4>
              <div className="p-3 bg-muted rounded-md">
                {selectedRequestId && (
                  <p className="text-sm">
                    {mockRequests.find(req => req.id === selectedRequestId)?.description}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Select Driver</h4>
              {availableDrivers.length === 0 ? (
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                  No available drivers at the moment. All drivers are currently busy.
                </div>
              ) : (
                <Select value={selectedDriverId || ''} onValueChange={setSelectedDriverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-40">
                      {availableDrivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} ({driver.completedAssignments} completed)
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignDriver} disabled={!selectedDriverId}>
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
