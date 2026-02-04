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

export default function RestaurantsPage() {
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch restaurants from database
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setRestaurants(data as Restaurant[]);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
