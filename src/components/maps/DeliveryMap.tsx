import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface DeliveryMapProps {
  deliveryAddress: string;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  restaurantName?: string;
  restaurantLat?: number | null;
  restaurantLng?: number | null;
}

export function DeliveryMap({
  deliveryAddress,
  deliveryLat,
  deliveryLng,
  restaurantName,
  restaurantLat,
  restaurantLng,
}: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Simulated delivery partner position for demo
  const [driverPosition, setDriverPosition] = useState({
    lat: restaurantLat || 40.7128,
    lng: restaurantLng || -74.006,
  });

  useEffect(() => {
    // Simulate driver movement
    if (deliveryLat && deliveryLng) {
      const interval = setInterval(() => {
        setDriverPosition((prev) => ({
          lat: prev.lat + (deliveryLat - prev.lat) * 0.1,
          lng: prev.lng + (deliveryLng - prev.lng) * 0.1,
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [deliveryLat, deliveryLng]);

  useEffect(() => {
    // For this demo, we'll show a static map image
    // In production, you would integrate Google Maps API here
    setIsLoading(false);
  }, []);

  const getStaticMapUrl = () => {
    const lat = deliveryLat || 40.7128;
    const lng = deliveryLng || -74.006;
    
    // Using a placeholder map image since we don't have Google Maps API key
    // In production, you would use the actual Google Maps Static API
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=600x300&markers=color:red%7C${lat},${lng}&key=YOUR_API_KEY`;
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback UI when Google Maps API is not configured
  return (
    <div className="relative">
      {/* Map Placeholder */}
      <div className="h-64 bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
        {/* Animated route line */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-md px-8">
            {/* Route path */}
            <div className="h-1 bg-primary/30 rounded-full relative">
              <div 
                className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: '60%' }}
              />
            </div>
            
            {/* Restaurant marker */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
              <div className="w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center border-2 border-primary">
                <span className="text-lg">🍽️</span>
              </div>
              <p className="text-xs text-center mt-1 font-medium whitespace-nowrap">
                {restaurantName || 'Restaurant'}
              </p>
            </div>
            
            {/* Driver marker (animated) */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000"
              style={{ left: '60%' }}
            >
              <div className="w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center animate-bounce">
                <Navigation className="w-6 h-6 text-primary-foreground" />
              </div>
              <p className="text-xs text-center mt-1 font-medium text-primary">
                Driver
              </p>
            </div>
            
            {/* Delivery marker */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
              <div className="w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center border-2 border-success">
                <MapPin className="w-5 h-5 text-success" />
              </div>
              <p className="text-xs text-center mt-1 font-medium whitespace-nowrap">
                You
              </p>
            </div>
          </div>
        </div>
        
        {/* Grid overlay for map effect */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      
      {/* Info bar */}
      <div className="p-4 bg-card border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Driver is on the way</p>
              <p className="text-xs text-muted-foreground">Estimated arrival: 10-15 min</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary">2.3 km</p>
            <p className="text-xs text-muted-foreground">away</p>
          </div>
        </div>
      </div>
    </div>
  );
}
