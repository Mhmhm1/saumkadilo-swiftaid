
import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

interface MapProps {
  center?: { lat: number; lng: number };
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    type?: 'ambulance' | 'emergency' | 'hospital';
  }>;
  showControls?: boolean;
  height?: string;
}

const Map: React.FC<MapProps> = ({
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  markers = [],
  showControls = true,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, this would use the Google Maps JavaScript API
    // For this prototype, we'll render a simple placeholder
    // You would replace this with actual map integration code
    
    const initMap = () => {
      // Simulate map loading delay
      setTimeout(() => {
        if (mapRef.current) {
          setLoading(false);
        }
      }, 1000);
    };
    
    initMap();
    
    // Cleanup function would remove the map instance
    return () => {
      // Cleanup code here
    };
  }, [center, markers]);

  // Generate a placeholder grid for the map
  const renderMapPlaceholder = () => {
    return (
      <div 
        className="bg-gray-100 dark:bg-gray-800 relative overflow-hidden"
        style={{ height }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0" 
          style={{ 
            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        ></div>
        
        {/* Center marker */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-primary rounded-full"></div>
          <div className="w-12 h-12 bg-primary/20 rounded-full absolute -top-4 -left-4 animate-pulse"></div>
        </div>
        
        {/* Marker dots for other locations */}
        {markers.map((marker, index) => {
          // Calculate position relative to center (simplified)
          const offsetX = (marker.position.lng - center.lng) * 100;
          const offsetY = (center.lat - marker.position.lat) * 100;
          
          const markerColor = marker.type === 'ambulance' 
            ? 'bg-info' 
            : marker.type === 'hospital' 
              ? 'bg-success' 
              : 'bg-emergency';
          
          return (
            <div 
              key={index}
              className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `calc(50% + ${offsetX}px)`, 
                top: `calc(50% + ${offsetY}px)`,
              }}
            >
              <div className={`w-full h-full ${markerColor} rounded-full z-10`}></div>
              <div className={`w-6 h-6 ${markerColor}/30 rounded-full absolute -top-1.5 -left-1.5 animate-pulse`}></div>
            </div>
          );
        })}
        
        {/* Map controls (simplified) */}
        {showControls && (
          <div className="absolute right-4 top-4 flex flex-col space-y-2">
            <button className="w-8 h-8 bg-white dark:bg-gray-900 rounded-md shadow flex items-center justify-center">
              <span className="text-gray-700 dark:text-gray-300">+</span>
            </button>
            <button className="w-8 h-8 bg-white dark:bg-gray-900 rounded-md shadow flex items-center justify-center">
              <span className="text-gray-700 dark:text-gray-300">−</span>
            </button>
          </div>
        )}
        
        {/* Attribution */}
        <div className="absolute bottom-1 right-1 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/50 px-1 rounded">
          SwiftAid Map
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <div ref={mapRef} className="relative">
        {loading ? (
          <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={{ height }}>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-destructive" style={{ height }}>
            Error loading map: {error}
          </div>
        ) : (
          renderMapPlaceholder()
        )}
      </div>
    </Card>
  );
};

export default Map;
