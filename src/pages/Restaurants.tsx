import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Star, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';
import { CuisineFilter } from '@/components/restaurants/CuisineFilter';
import { supabase } from '@/integrations/supabase/client';
import type { Restaurant } from '@/types';

// Sample data for demo
const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    owner_id: '1',
    name: 'Spice Garden',
    description: 'Authentic Indian cuisine with a modern twist',
    cuisine_type: 'Indian',
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop',
    address: '123 Curry Lane, Food District',
    latitude: null,
    longitude: null,
    phone: '+1234567890',
    opening_time: '09:00',
    closing_time: '22:00',
    min_order_amount: 15,
    delivery_fee: 2.99,
    avg_delivery_time: 35,
    rating: 4.7,
    total_reviews: 324,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    owner_id: '2',
    name: 'Dragon Wok',
    description: 'Traditional Chinese flavors',
    cuisine_type: 'Chinese',
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop',
    address: '456 Noodle Street',
    latitude: null,
    longitude: null,
    phone: '+1234567891',
    opening_time: '10:00',
    closing_time: '23:00',
    min_order_amount: 12,
    delivery_fee: 0,
    avg_delivery_time: 25,
    rating: 4.5,
    total_reviews: 256,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    owner_id: '3',
    name: 'Bella Italia',
    description: 'Authentic Italian pasta and pizza',
    cuisine_type: 'Italian',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
    address: '789 Pizza Avenue',
    latitude: null,
    longitude: null,
    phone: '+1234567892',
    opening_time: '11:00',
    closing_time: '22:00',
    min_order_amount: 20,
    delivery_fee: 3.49,
    avg_delivery_time: 40,
    rating: 4.8,
    total_reviews: 512,
    is_active: true,
    is_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    owner_id: '4',
    name: 'Taco Fiesta',
    description: 'Fresh Mexican street food',
    cuisine_type: 'Mexican',
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop',
    address: '321 Salsa Boulevard',
    latitude: null,
    longitude: null,
    phone: '+1234567893',
    opening_time: '09:00',
    closing_time: '21:00',
    min_order_amount: 10,
    delivery_fee: 1.99,
    avg_delivery_time: 20,
    rating: 4.6,
    total_reviews: 189,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    owner_id: '5',
    name: 'Sushi Master',
    description: 'Fresh sushi and Japanese delicacies',
    cuisine_type: 'Japanese',
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop',
    address: '567 Sakura Street',
    latitude: null,
    longitude: null,
    phone: '+1234567894',
    opening_time: '11:00',
    closing_time: '22:00',
    min_order_amount: 25,
    delivery_fee: 4.99,
    avg_delivery_time: 45,
    rating: 4.9,
    total_reviews: 678,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    owner_id: '6',
    name: 'Thai Orchid',
    description: 'Authentic Thai street food',
    cuisine_type: 'Thai',
    image_url: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&auto=format&fit=crop',
    address: '890 Bangkok Lane',
    latitude: null,
    longitude: null,
    phone: '+1234567895',
    opening_time: '10:00',
    closing_time: '22:00',
    min_order_amount: 15,
    delivery_fee: 2.49,
    avg_delivery_time: 30,
    rating: 4.4,
    total_reviews: 145,
    is_active: true,
    is_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    owner_id: '7',
    name: 'Burger Joint',
    description: 'Gourmet burgers and fries',
    cuisine_type: 'American',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
    address: '234 Main Street',
    latitude: null,
    longitude: null,
    phone: '+1234567896',
    opening_time: '11:00',
    closing_time: '23:00',
    min_order_amount: 12,
    delivery_fee: 1.99,
    avg_delivery_time: 25,
    rating: 4.3,
    total_reviews: 234,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    owner_id: '8',
    name: 'Mediterranean Grill',
    description: 'Fresh Mediterranean cuisine',
    cuisine_type: 'Mediterranean',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop',
    address: '456 Olive Street',
    latitude: null,
    longitude: null,
    phone: '+1234567897',
    opening_time: '10:00',
    closing_time: '21:00',
    min_order_amount: 18,
    delivery_fee: 2.99,
    avg_delivery_time: 35,
    rating: 4.6,
    total_reviews: 167,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function RestaurantsPage() {
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>(SAMPLE_RESTAURANTS);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(SAMPLE_RESTAURANTS);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort restaurants
  useEffect(() => {
    let result = [...restaurants];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by cuisine
    if (selectedCuisine !== 'all') {
      result = result.filter((r) => r.cuisine_type === selectedCuisine);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'delivery_time':
        result.sort((a, b) => a.avg_delivery_time - b.avg_delivery_time);
        break;
      case 'delivery_fee':
        result.sort((a, b) => a.delivery_fee - b.delivery_fee);
        break;
    }

    setFilteredRestaurants(result);
  }, [restaurants, searchQuery, selectedCuisine, sortBy]);

  return (
    <Layout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              All Restaurants
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Delivering to your area
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 mb-8"
          >
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search restaurants or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">
                    <span className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Top Rated
                    </span>
                  </SelectItem>
                  <SelectItem value="delivery_time">Fastest Delivery</SelectItem>
                  <SelectItem value="delivery_fee">Lowest Delivery Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cuisine Filter */}
            <CuisineFilter selected={selectedCuisine} onSelect={setSelectedCuisine} />
          </motion.div>

          {/* Results count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground mb-6"
          >
            {filteredRestaurants.length} restaurants found
          </motion.p>

          {/* Restaurant Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-md">
                  <div className="aspect-[16/10] skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="h-6 w-3/4 skeleton" />
                    <div className="h-4 w-1/2 skeleton" />
                    <div className="h-4 w-full skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                No restaurants found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCuisine('all');
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
