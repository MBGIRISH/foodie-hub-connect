export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  cuisine_type: string;
  image_url: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  opening_time: string | null;
  closing_time: string | null;
  min_order_amount: number;
  delivery_fee: number;
  avg_delivery_time: number;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
  is_available: boolean;
  prep_time: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string | null;
  restaurant_id: string;
  delivery_partner_id: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  special_instructions: string | null;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  restaurant_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type UserRole = 'customer' | 'restaurant_owner' | 'delivery_partner' | 'admin';

export interface CuisineFilter {
  label: string;
  value: string;
  emoji: string;
}

export const CUISINE_FILTERS: CuisineFilter[] = [
  { label: 'All', value: 'all', emoji: '🍽️' },
  { label: 'Indian', value: 'Indian', emoji: '🍛' },
  { label: 'Chinese', value: 'Chinese', emoji: '🥡' },
  { label: 'Italian', value: 'Italian', emoji: '🍕' },
  { label: 'Mexican', value: 'Mexican', emoji: '🌮' },
  { label: 'Japanese', value: 'Japanese', emoji: '🍣' },
  { label: 'Thai', value: 'Thai', emoji: '🍜' },
  { label: 'American', value: 'American', emoji: '🍔' },
  { label: 'Mediterranean', value: 'Mediterranean', emoji: '🥙' },
];
