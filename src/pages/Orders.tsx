import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import type { Order, Restaurant } from '@/types';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<(Order & { restaurant?: Restaurant })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth?redirect=/orders');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (*)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersWithRestaurants = data?.map((order: any) => ({
        ...order,
        restaurant: order.restaurants,
      })) || [];

      setOrders(ordersWithRestaurants);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'out_for_delivery':
        return <Truck className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-success text-success-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      case 'out_for_delivery':
        return 'bg-primary text-primary-foreground';
      case 'preparing':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-secondary rounded" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-secondary rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-2xl md:text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track and view your order history</p>
          </motion.div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="font-display font-semibold text-xl mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                Your order history will appear here once you place an order
              </p>
              <Link to="/restaurants">
                <Button className="bg-gradient-hero hover:opacity-90">
                  Browse Restaurants
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Restaurant Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={order.restaurant?.image_url || '/placeholder.svg'}
                          alt={order.restaurant?.name || 'Restaurant'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {order.restaurant?.name || 'Restaurant'}
                          </h3>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{getStatusLabel(order.status)}</span>
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(order.created_at)}
                        </p>
                        
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {order.delivery_address.split(',')[0]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatCurrency(order.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      
                      <Link to={`/order/${order.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          {order.status === 'delivered' ? 'View Details' : 'Track Order'}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
