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
import type { Restaurant, MenuItem, MenuCategory } from '@/types';

// Sample data with Indian prices
const SAMPLE_RESTAURANT: Restaurant = {
  id: '1',
  owner_id: '1',
  name: 'Spice Garden',
  description: 'Experience the authentic flavors of India with our carefully crafted dishes. From creamy butter chicken to spicy vindaloo, every dish tells a story of tradition and passion.',
  cuisine_type: 'Indian',
  image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&auto=format&fit=crop',
  address: '123 MG Road, Connaught Place, New Delhi, 110001',
  latitude: null,
  longitude: null,
  phone: '+91 98765 43210',
  opening_time: '09:00',
  closing_time: '22:00',
  min_order_amount: 199,
  delivery_fee: 49,
  avg_delivery_time: 35,
  rating: 4.7,
  total_reviews: 324,
  is_active: true,
  is_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const SAMPLE_CATEGORIES: MenuCategory[] = [
  { id: '1', restaurant_id: '1', name: 'Appetizers', description: 'Start your meal right', sort_order: 1, created_at: new Date().toISOString() },
  { id: '2', restaurant_id: '1', name: 'Main Course', description: 'Hearty main dishes', sort_order: 2, created_at: new Date().toISOString() },
  { id: '3', restaurant_id: '1', name: 'Breads', description: 'Fresh baked breads', sort_order: 3, created_at: new Date().toISOString() },
  { id: '4', restaurant_id: '1', name: 'Desserts', description: 'Sweet endings', sort_order: 4, created_at: new Date().toISOString() },
];

const SAMPLE_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    restaurant_id: '1',
    category_id: '1',
    name: 'Samosas (2 pcs)',
    description: 'Crispy pastry filled with spiced potatoes and peas',
    price: 89,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop',
    is_vegetarian: true,
    is_vegan: false,
    is_spicy: false,
    is_available: true,
    prep_time: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    restaurant_id: '1',
    category_id: '1',
    name: 'Chicken Tikka',
    description: 'Marinated chicken pieces grilled to perfection',
    price: 199,
    image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&auto=format&fit=crop',
    is_vegetarian: false,
    is_vegan: false,
    is_spicy: true,
    is_available: true,
    prep_time: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    restaurant_id: '1',
    category_id: '2',
    name: 'Butter Chicken',
    description: 'Tender chicken in creamy tomato sauce with aromatic spices',
    price: 349,
    image_url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop',
    is_vegetarian: false,
    is_vegan: false,
    is_spicy: false,
    is_available: true,
    prep_time: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    restaurant_id: '1',
    category_id: '2',
    name: 'Lamb Rogan Josh',
    description: 'Slow-cooked lamb in rich Kashmiri spices',
    price: 429,
    image_url: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&auto=format&fit=crop',
    is_vegetarian: false,
    is_vegan: false,
    is_spicy: true,
    is_available: true,
    prep_time: 25,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    restaurant_id: '1',
    category_id: '2',
    name: 'Palak Paneer',
    description: 'Fresh cottage cheese cubes in creamy spinach sauce',
    price: 279,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop',
    is_vegetarian: true,
    is_vegan: false,
    is_spicy: false,
    is_available: true,
    prep_time: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    restaurant_id: '1',
    category_id: '2',
    name: 'Chicken Vindaloo',
    description: 'Fiery hot chicken curry with potatoes',
    price: 319,
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop',
    is_vegetarian: false,
    is_vegan: false,
    is_spicy: true,
    is_available: true,
    prep_time: 20,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    restaurant_id: '1',
    category_id: '3',
    name: 'Garlic Naan',
    description: 'Soft leavened bread topped with garlic and butter',
    price: 59,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop',
    is_vegetarian: true,
    is_vegan: false,
    is_spicy: false,
    is_available: true,
    prep_time: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    restaurant_id: '1',
    category_id: '4',
    name: 'Gulab Jamun',
    description: 'Sweet milk dumplings in rose-flavored syrup',
    price: 99,
    image_url: 'https://images.unsplash.com/photo-1666190094617-d2e8dbdf1a09?w=400&auto=format&fit=crop',
    is_vegetarian: true,
    is_vegan: false,
    is_spicy: false,
    is_available: true,
    prep_time: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(SAMPLE_RESTAURANT);
  const [categories, setCategories] = useState<MenuCategory[]>(SAMPLE_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(SAMPLE_MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState(SAMPLE_CATEGORIES[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter((item) => item.category_id === categoryId);
  };

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
