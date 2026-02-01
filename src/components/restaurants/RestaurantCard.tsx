import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Restaurant } from '@/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
}

export function RestaurantCard({ restaurant, index = 0 }: RestaurantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link to={`/restaurant/${restaurant.id}`}>
        <div className="group bg-card rounded-2xl overflow-hidden shadow-md card-hover border border-border/50">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={restaurant.image_url || '/placeholder.svg'}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-overlay opacity-60" />
            
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {restaurant.is_verified && (
                <Badge className="bg-success text-success-foreground gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Rating badge */}
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-semibold text-sm">{restaurant.rating.toFixed(1)}</span>
                <span className="text-muted-foreground text-xs">
                  ({restaurant.total_reviews})
                </span>
              </div>
            </div>

            {/* Delivery time */}
            <div className="absolute bottom-3 right-3">
              <div className="flex items-center gap-1 bg-card/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{restaurant.avg_delivery_time} min</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{restaurant.cuisine_type}</span>
              <span>•</span>
              <span>${restaurant.min_order_amount} min order</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{restaurant.address}</span>
            </div>

            {/* Delivery fee */}
            <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {restaurant.delivery_fee > 0 
                  ? `$${restaurant.delivery_fee.toFixed(2)} delivery` 
                  : 'Free delivery'}
              </span>
              <span className="text-sm font-medium text-primary group-hover:underline">
                View Menu →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
