import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Package,
  Truck,
  Home,
  ChefHat,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Layout } from '@/components/layout/Layout';
import { DeliveryMap } from '@/components/maps/DeliveryMap';
import { supabase } from '@/integrations/supabase/client';
import type { Order, OrderItem, Restaurant } from '@/types';

const ORDER_STATUSES = [
  { key: 'pending', label: 'Order Placed', icon: Package, description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Restaurant confirmed your order' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Your food is being prepared' },
  { key: 'ready_for_pickup', label: 'Ready', icon: Package, description: 'Order is ready for pickup' },
  { key: 'out_for_delivery', label: 'On the Way', icon: Truck, description: 'Your order is on its way' },
  { key: 'delivered', label: 'Delivered', icon: Home, description: 'Order has been delivered' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel(`order-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            setOrder(payload.new as Order);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);

      // Fetch restaurant
      if (orderData.restaurant_id) {
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', orderData.restaurant_id)
          .single();
        
        setRestaurant(restaurantData);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStatusIndex = () => {
    if (!order) return 0;
    return ORDER_STATUSES.findIndex((s) => s.key === order.status);
  };

  const getProgressPercentage = () => {
    const index = getCurrentStatusIndex();
    if (index === -1) return 0;
    return ((index + 1) / ORDER_STATUSES.length) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      case 'out_for_delivery':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-64 bg-secondary rounded" />
              <div className="h-64 bg-secondary rounded-2xl" />
              <div className="h-48 bg-secondary rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4 text-center py-16">
            <h2 className="font-display font-semibold text-2xl mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">This order doesn't exist or you don't have access to it.</p>
            <Link to="/orders">
              <Button className="bg-gradient-hero hover:opacity-90">View My Orders</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Link to="/orders">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">Track Order</h1>
                <p className="text-sm text-muted-foreground">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={fetchOrderDetails}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display font-semibold text-lg">Order Status</h2>
                    <p className="text-sm text-muted-foreground">
                      {isDelivered
                        ? 'Your order has been delivered!'
                        : isCancelled
                        ? 'This order was cancelled'
                        : 'Your order is on its way'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {ORDER_STATUSES.find((s) => s.key === order.status)?.label || order.status}
                  </Badge>
                </div>

                {!isCancelled && (
                  <>
                    <Progress value={getProgressPercentage()} className="h-2 mb-6" />

                    <div className="space-y-4">
                      {ORDER_STATUSES.slice(0, -1).map((status, index) => {
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = index === currentStatusIndex;
                        const Icon = status.icon;

                        return (
                          <div
                            key={status.key}
                            className={`flex items-start gap-4 ${
                              isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCurrent
                                  ? 'bg-primary text-primary-foreground animate-pulse'
                                  : isCompleted
                                  ? 'bg-success text-success-foreground'
                                  : 'bg-secondary'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="pt-2">
                              <p className="font-medium">{status.label}</p>
                              <p className="text-sm text-muted-foreground">{status.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>

              {/* Map */}
              {order.status === 'out_for_delivery' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border/50"
                >
                  <DeliveryMap
                    deliveryAddress={order.delivery_address}
                    deliveryLat={order.delivery_latitude}
                    deliveryLng={order.delivery_longitude}
                    restaurantName={restaurant?.name}
                    restaurantLat={restaurant?.latitude}
                    restaurantLng={restaurant?.longitude}
                  />
                </motion.div>
              )}

              {/* Delivery Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
              >
                <h3 className="font-display font-semibold text-lg mb-4">Delivery Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    </div>
                  </div>
                  
                  {order.estimated_delivery_time && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Estimated Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.estimated_delivery_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {restaurant && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{restaurant.name}</p>
                        <p className="text-sm text-muted-foreground">{restaurant.phone}</p>
                      </div>
                    </div>
                  )}

                  {order.special_instructions && (
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm font-medium">Special Instructions:</p>
                      <p className="text-sm text-muted-foreground">{order.special_instructions}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 sticky top-24"
              >
                <h3 className="font-display font-semibold text-lg mb-4">Order Summary</h3>
                
                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span>${item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>${(order.delivery_fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${(order.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-3 rounded-lg bg-success/10 flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>Cash on Delivery</span>
                </div>

                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => navigate('/orders')}
                >
                  View All Orders
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
