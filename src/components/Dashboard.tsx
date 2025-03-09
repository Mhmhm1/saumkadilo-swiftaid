import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  EmergencyRequest, 
  mockRequests, 
  mockDrivers, 
  assignDriver, 
  updateRequestStatus,
  getAllRatings
} from '@/utils/mockData';
import RequestCard from './RequestCard';
import Map from './Map';
import DriverProfile from './DriverProfile';
import MessageCenter from './MessageCenter';
import ServiceRatings from './ServiceRatings';
import { 
  AlertTriangle, 
  Ambulance, 
  Clock, 
  CheckCircle, 
  User, 
  History,
  MessageSquare,
  X,
  MapPin,
  Star
} from 'lucide-react';
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardProps {
  userRole: 'admin' | 'driver' | 'requester';
  userId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, userId }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [historyTab, setHistoryTab] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  
  const getFilteredRequests = () => {
    if (historyTab) {
      if (userRole === 'admin') {
        return mockRequests.filter(req => req.status === 'completed');
      } else if (userRole === 'driver') {
        return mockRequests.filter(req => req.status === 'completed' && req.assignedTo === userId);
      } else {
        return mockRequests.filter(req => req.status === 'completed' && req.userId === userId);
      }
    } else {
      if (userRole === 'admin') {
        switch (activeTab) {
          case 'pending':
            return mockRequests.filter(req => req.status === 'pending');
          case 'assigned':
            return mockRequests.filter(req => req.status === 'assigned');
          case 'in-progress':
            return mockRequests.filter(req => req.status === 'in-progress');
          case 'all':
          default:
            return mockRequests.filter(req => req.status !== 'completed');
        }
      } else if (userRole === 'driver') {
        return mockRequests.filter(req => 
          req.assignedTo === userId && 
          req.status !== 'completed'
        );
      } else {
        return mockRequests.filter(req => 
          req.userId === userId && 
          req.status !== 'completed'
        );
      }
    }
  };
  
  const filteredRequests = getFilteredRequests();
  const selectedRequest = selectedRequestId 
    ? mockRequests.find(req => req.id === selectedRequestId) 
    : null;
  
  const availableDrivers = mockDrivers.filter(driver => driver.status === 'available');
  
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
  
  const handleOpenMessageDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setMessageDialogOpen(true);
  };
  
  const handleStartResponse = (requestId: string) => {
    updateRequestStatus(requestId, 'in-progress', 'Driver has arrived at the location');
    toast.success('Response started. Status updated to In Progress');
  };
  
  const handleCompleteRequest = (requestId: string) => {
    updateRequestStatus(requestId, 'completed', 'Request completed by driver');
    toast.success('Request marked as completed');
  };
  
  const getStats = () => {
    const pendingCount = mockRequests.filter(req => req.status === 'pending').length;
    const assignedCount = mockRequests.filter(req => req.status === 'assigned').length;
    const inProgressCount = mockRequests.filter(req => req.status === 'in-progress').length;
    const completedCount = mockRequests.filter(req => req.status === 'completed').length;
    
    // Count ratings
    const ratingCount = mockRequests.filter(req => req.rating !== undefined).length;
    
    return { pendingCount, assignedCount, inProgressCount, completedCount, ratingCount };
  };
  
  const stats = getStats();
  
  const getMapMarkers = () => {
    const markers = [];
    
    for (const request of filteredRequests) {
      if (request.location?.coordinates) {
        markers.push({
          position: request.location.coordinates,
          title: request.description,
          type: 'emergency'
        });
      }
    }
    
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
      {userRole === 'driver' && (
        <DriverProfile />
      )}
      
      {userRole === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ratings</p>
                  <h3 className="text-2xl font-bold">{stats.ratingCount}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
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
      
      {userRole === 'admin' && !showRatings && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Driver Management</CardTitle>
            <CardDescription>
              Monitor and manage ambulance drivers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockDrivers.map(driver => (
                <Card key={driver.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={driver.photoUrl} alt={driver.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {driver.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{driver.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            driver.status === 'available' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : driver.status === 'busy'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="text-sm">
                          <div className="flex items-center text-xs mt-1">
                            <Ambulance className="w-3 h-3 mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground">{driver.ambulanceId}</span>
                          </div>
                          
                          <div className="flex items-center text-xs mt-1">
                            <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground">{driver.location?.address || 'Unknown'}</span>
                          </div>
                          
                          {driver.currentAssignment && (
                            <div className="flex items-center text-xs mt-1">
                              <AlertTriangle className="w-3 h-3 mr-1 text-warning" />
                              <span>On emergency response</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-xs mt-1">
                            <CheckCircle className="w-3 h-3 mr-1 text-success" />
                            <span>{driver.completedAssignments} completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {userRole === 'admin' && showRatings && (
        <ServiceRatings ratings={getAllRatings()} />
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {historyTab ? 'Request History' : (showRatings ? 'Service Ratings' : 'Emergency Requests')}
          </h2>
          <p className="text-muted-foreground">
            {historyTab 
              ? 'View past emergency requests' 
              : (showRatings 
                  ? 'User feedback for completed emergency services' 
                  : 'Manage active emergency requests')}
          </p>
        </div>
        
        {userRole === 'admin' && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setHistoryTab(false);
                setShowRatings(!showRatings);
              }}
            >
              {showRatings ? (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  View Requests
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  View Ratings
                </>
              )}
            </Button>
            
            {!showRatings && (
              <Button
                variant="outline"
                onClick={() => setHistoryTab(!historyTab)}
              >
                {historyTab ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    View Active
                  </>
                ) : (
                  <>
                    <History className="w-4 h-4 mr-2" />
                    View History
                  </>
                )}
              </Button>
            )}
          </div>
        )}
        
        {userRole !== 'admin' && (
          <Button
            variant="outline"
            onClick={() => setHistoryTab(!historyTab)}
          >
            {historyTab ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                View Active
              </>
            ) : (
              <>
                <History className="w-4 h-4 mr-2" />
                View History
              </>
            )}
          </Button>
        )}
      </div>
      
      {!showRatings && !historyTab && userRole === 'admin' && (
        <Tabs defaultValue="all" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All Active</TabsTrigger>
            <TabsTrigger value="pending">
              Pending <Badge className="ml-2 bg-warning/20 text-warning-foreground">{stats.pendingCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      
      {showRatings && userRole === 'admin' ? null : (
        filteredRequests.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center p-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No requests found</h3>
              <p className="text-muted-foreground mt-2">
                {historyTab
                  ? "No completed requests found in the history."
                  : userRole === 'admin' 
                    ? 'There are no emergency requests in this category.' 
                    : userRole === 'driver'
                      ? 'You have no assigned emergencies at the moment.'
                      : 'You have not made any emergency requests yet.'}
              </p>
            </CardContent>
          </Card>
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
                onViewMessages={handleOpenMessageDialog}
              />
            ))}
          </div>
        )
      )}
      
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
      
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <div className="absolute right-4 top-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMessageDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedRequest && (
            <div className="h-full py-2">
              <MessageCenter request={selectedRequest} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
