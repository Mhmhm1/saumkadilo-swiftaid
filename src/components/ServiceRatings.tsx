
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmergencyRequest } from '@/utils/mockData';

interface ServiceRatingProps {
  ratings: {
    requestId: string;
    rating: number;
    feedback: string;
    timestamp: Date;
    userName: string;
    userPhoto?: string;
    emergencyType?: string;
  }[];
}

const ServiceRatings: React.FC<ServiceRatingProps> = ({ ratings }) => {
  if (!ratings || ratings.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center p-12">
          <div className="flex justify-center">
            <Star className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No ratings yet</h3>
          <p className="text-muted-foreground mt-2">
            Ratings will appear here once users rate your emergency services.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Service Ratings</CardTitle>
        <CardDescription>User feedback and ratings for emergency services</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {ratings.map((item) => (
              <Card key={item.requestId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.userPhoto} alt={item.userName} />
                      <AvatarFallback>{item.userName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{item.userName}</h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center mt-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-4 h-4",
                              star <= item.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                        {item.emergencyType && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {item.emergencyType}
                          </span>
                        )}
                      </div>
                      
                      {item.feedback && (
                        <p className="text-sm mt-1 bg-muted/30 p-2 rounded-md">
                          "{item.feedback}"
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ServiceRatings;
