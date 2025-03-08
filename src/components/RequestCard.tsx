
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User, Phone, AlertTriangle, CheckCircle, Ambulance, MessageSquare, Star } from 'lucide-react';
import { EmergencyRequest, addRatingToRequest } from '@/utils/mockData';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface RequestCardProps {
  request: EmergencyRequest;
  isAdmin?: boolean;
  isDriver?: boolean;
  onAssign?: (requestId: string) => void;
  onStartResponse?: (requestId: string) => void;
  onComplete?: (requestId: string) => void;
  onViewMessages?: (requestId: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isAdmin = false,
  isDriver = false,
  onAssign,
  onStartResponse,
  onComplete,
  onViewMessages
}) => {
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

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

  // Count unread messages (for demo purposes, just show if there are messages)
  const hasMessages = request.messages && request.messages.length > 0;
  
  // Check if this request has already been rated
  const hasRating = request.rating !== undefined;

  const handleCompleteRequest = () => {
    if (isDriver && onComplete) {
      onComplete(request.id);
    } else if (!isAdmin && !isDriver && request.status === 'completed' && !hasRating) {
      // Show rating dialog for requester after completion
      setShowRatingDialog(true);
    }
  };

  const handleSubmitRating = () => {
    // Save the rating to our data store
    addRatingToRequest(request.id, rating, feedback);
    setShowRatingDialog(false);
    
    if (rating > 3) {
      toast.success("Thank you for your feedback! We're glad you enjoyed our service.");
    } else {
      toast.success("Thank you for your feedback. We'll use it to improve our service.");
    }
    
    // Reset state
    setRating(0);
    setFeedback('');
  };

  return (
    <>
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
              
              {hasMessages && (
                <Badge variant="outline" className="ml-2 bg-primary/20 text-primary border-primary/50">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Messages
                </Badge>
              )}
              
              {hasRating && (
                <Badge variant="outline" className="ml-2 bg-yellow-400/20 text-yellow-600 border-yellow-400/50">
                  <Star className="w-3 h-3 mr-1" />
                  Rated ({request.rating?.rating}/5)
                </Badge>
              )}
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
              {request.patientName && request.patientName !== request.userName && (
                <span className="ml-1 text-muted-foreground">(Patient: {request.patientName})</span>
              )}
            </div>
            
            {request.userPhone && (
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-2 text-muted-foreground" />
                <span>{request.userPhone}</span>
              </div>
            )}
            
            {request.emergencyType && (
              <div className="flex items-center mt-1">
                <AlertTriangle className="w-3 h-3 mr-2 text-muted-foreground" />
                <span>{request.emergencyType}</span>
                {request.patientAge && (
                  <span className="ml-2 text-muted-foreground">Age: {request.patientAge}</span>
                )}
                {request.patientGender && (
                  <span className="ml-2 text-muted-foreground">Gender: {request.patientGender}</span>
                )}
              </div>
            )}
            
            {request.assignedTo && (request.status !== 'completed') && (
              <div className="mt-2 p-2 bg-muted/20 rounded-md">
                <div className="flex items-center">
                  <Ambulance className="w-3 h-3 mr-2 text-primary" />
                  <span className="font-medium">Ambulance {request.ambulanceId}</span>
                </div>
                
                <div className="flex items-center mt-1">
                  <div className="flex items-center flex-1">
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={request.driverPhoto} alt={request.driverName} />
                      <AvatarFallback className="text-xs">{request.driverName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{request.driverName}</span>
                  </div>
                  
                  {request.driverPhone && (
                    <a href={`tel:${request.driverPhone}`} className="text-primary">
                      <Phone className="w-3 h-3" />
                    </a>
                  )}
                </div>
                
                {request.estimatedArrival && (
                  <div className="flex items-center mt-1 text-xs">
                    <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                    <span>
                      {new Date() > request.estimatedArrival 
                        ? 'Arrived' 
                        : `ETA: ${formatTime(request.estimatedArrival)}`}
                    </span>
                  </div>
                )}
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
          
          {request.status !== 'completed' && (
            <Button 
              variant="outline"
              className="w-full ml-2"
              onClick={() => onViewMessages && onViewMessages(request.id)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
          )}
          
          {(!isAdmin && !isDriver && request.status === 'completed') && (
            <Button 
              variant={hasRating ? "outline" : "default"}
              className="w-full"
              onClick={handleCompleteRequest}
              disabled={hasRating}
            >
              <Star className="w-4 h-4 mr-2" />
              {hasRating ? "Already Rated" : "Rate Service"}
            </Button>
          )}

          {(!isAdmin && !isDriver && request.status === 'pending') && (
            <Button 
              variant="outline"
              className="w-full"
            >
              View Details
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Emergency Service Experience</DialogTitle>
            <DialogDescription>
              Your feedback helps us improve our emergency response services.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex justify-center items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star 
                    className={cn(
                      "w-8 h-8 transition-all",
                      (star <= rating || star <= hoveredRating) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300"
                    )} 
                  />
                </button>
              ))}
            </div>
            
            <Textarea
              placeholder={rating > 3 ? "Would you like to leave additional feedback?" : "How could we improve our service?"}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRatingDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={rating === 0}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestCard;
