import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  BadgeCheck,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { MenuItemCard } from '@/components/menu/MenuItemCard';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import type { Restaurant, MenuItem, MenuCategory } from '@/types';

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    if (id) {
      fetchRestaurantData();
    }
  }, [id]);

  const fetchRestaurantData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) throw restaurantError;
      setRestaurant(restaurantData as Restaurant);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', id)
        .order('sort_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData as MenuCategory[]);
      if (categoriesData.length > 0) {
        setActiveCategory(categoriesData[0].id);
      }

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', id)
        .eq('is_available', true);

      if (menuError) throw menuError;
      setMenuItems(menuData as MenuItem[]);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter((item) => item.category_id === categoryId);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-secondary rounded-2xl" />
            <div className="h-8 w-48 bg-secondary rounded" />
            <div className="h-48 bg-secondary rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div className="pt-24 pb-16 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold">Restaurant not found</h1>
          <Link to="/restaurants">
            <Button className="mt-4">Back to Restaurants</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 lg:h-96">
        <img
          src={restaurant.image_url || '/placeholder.svg'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-overlay" />
        
        {/* Back button */}
        <div className="absolute top-20 left-4 md:left-8">
          <Link to="/restaurants">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-2">
              {restaurant.is_verified && (
                <Badge className="bg-success text-success-foreground gap-1">
                  <BadgeCheck className="w-3 h-3" />
                  Verified
                </Badge>
              )}
              <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                {restaurant.rating.toFixed(1)} ({restaurant.total_reviews} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {restaurant.avg_delivery_time} min
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {restaurant.address.split(',')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Details Bar */}
      <div className="bg-card border-b sticky top-16 md:top-20 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Min. order: <span className="font-medium text-foreground">{formatCurrency(restaurant.min_order_amount)}</span>
              </span>
              <span className="text-muted-foreground">
                Delivery: <span className="font-medium text-foreground">
                  {restaurant.delivery_fee > 0 ? formatCurrency(restaurant.delivery_fee) : 'Free'}
                </span>
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {restaurant.phone}
              </span>
            </div>
            
            {/* Mobile cart button */}
            <Link to="/cart" className="lg:hidden">
              <Button className="bg-gradient-hero hover:opacity-90 gap-2">
                <ShoppingBag className="w-4 h-4" />
                Cart ({itemCount})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Menu Section */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="flex w-full justify-start overflow-x-auto bg-transparent border-b rounded-none p-0 h-auto mb-6">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="mt-0">
                    <div className="space-y-4">
                      <h2 className="font-display font-semibold text-xl mb-4">
                        {category.name}
                      </h2>
                      {getItemsByCategory(category.id).map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          restaurantId={restaurant.id}
                          restaurantName={restaurant.name}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          </div>

          {/* Sticky Cart Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-36">
              <CartSummary />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Bar */}
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-4 lg:hidden z-50"
        >
          <Link to="/cart">
            <Button className="w-full bg-gradient-hero hover:opacity-90 h-12 text-base font-semibold gap-2">
              <ShoppingBag className="w-5 h-5" />
              View Cart ({itemCount} items)
            </Button>
          </Link>
        </motion.div>
      )}
    </Layout>
  );
}
