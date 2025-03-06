
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Phone, AlertTriangle, CheckCircle, Ambulance } from 'lucide-react';
import { EmergencyRequest } from '@/utils/mockData';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: EmergencyRequest;
  isAdmin?: boolean;
  isDriver?: boolean;
  onAssign?: (requestId: string) => void;
  onStartResponse?: (requestId: string) => void;
  onComplete?: (requestId: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isAdmin = false,
  isDriver = false,
  onAssign,
  onStartResponse,
  onComplete
}) => {
  // Get badge color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-emergency text-emergency-foreground animate-pulse';
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-info text-info-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  // Get status badge styles
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/20 text-warning-foreground border-warning/50';
      case 'assigned':
        return 'bg-info/20 text-info-foreground border-info/50';
      case 'in-progress':
        return 'bg-primary/20 text-primary-foreground border-primary/50';
      case 'completed':
        return 'bg-success/20 text-success-foreground border-success/50';
      case 'cancelled':
        return 'bg-muted/20 text-muted-foreground border-muted/50';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/50';
    }
  };
  
  // Format time
  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-md border",
      request.severity === 'critical' && "border-emergency/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge className={getSeverityColor(request.severity)}>
              {request.severity.charAt(0).toUpperCase() + request.severity.slice(1)}
            </Badge>
            
            <Badge variant="outline" className={cn("ml-2 border", getStatusColor(request.status))}>
              {request.status === 'in-progress' ? 'In Progress' : 
                request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(request.timestamp)}
          </div>
        </div>
        <CardTitle className="text-xl mt-2">{request.description.substring(0, 60)}{request.description.length > 60 ? '...' : ''}</CardTitle>
        <CardDescription className="flex items-center mt-1">
          <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
          {request.location.address}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-col space-y-1 text-sm">
          <div className="flex items-center">
            <User className="w-3 h-3 mr-2 text-muted-foreground" />
            <span>{request.userName}</span>
          </div>
          
          {request.userPhone && (
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-2 text-muted-foreground" />
              <span>{request.userPhone}</span>
            </div>
          )}
          
          {request.assignedTo && (
            <div className="flex items-center mt-2">
              <Ambulance className="w-3 h-3 mr-2 text-primary" />
              <span>Ambulance assigned</span>
            </div>
          )}
          
          {request.estimatedArrival && request.status !== 'completed' && (
            <div className="flex items-center mt-1">
              <Clock className="w-3 h-3 mr-2 text-primary" />
              <span>
                {new Date() > request.estimatedArrival 
                  ? 'Arrived' 
                  : `ETA: ${formatTime(request.estimatedArrival)}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {isAdmin && request.status === 'pending' && (
          <Button 
            onClick={() => onAssign && onAssign(request.id)}
            className="w-full"
          >
            Assign Ambulance
          </Button>
        )}
        
        {isDriver && request.status === 'assigned' && (
          <Button 
            onClick={() => onStartResponse && onStartResponse(request.id)}
            className="w-full"
            variant="default"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Start Response
          </Button>
        )}
        
        {isDriver && request.status === 'in-progress' && (
          <Button 
            onClick={() => onComplete && onComplete(request.id)}
            className="w-full"
            variant="default"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete
          </Button>
        )}
        
        {(!isAdmin && !isDriver) && (
          <Button 
            variant="outline"
            className="w-full"
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RequestCard;
