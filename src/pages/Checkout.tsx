import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Banknote,
  Clock,
  ShoppingBag,
  CheckCircle,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Layout } from '@/components/layout/Layout';
import { useCartStore } from '@/stores/cartStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, restaurantId, restaurantName, clearCart } = useCartStore();
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Form state
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const subtotal = getTotal();
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        toast.error('Please sign in to checkout');
        navigate('/auth?redirect=/checkout');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load saved address from profile
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('address, phone')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.address) setAddress(data.address);
          if (data?.phone) setPhone(data.phone);
        });
    }
  }, [user]);

  const detectLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLocation({ lat, lng });
          
          // Reverse geocode using a free API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data.display_name) {
              setAddress(data.display_name);
            }
          } catch (error) {
            console.error('Failed to get address', error);
          }
          setIsLocating(false);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Could not detect location. Please enter address manually.');
          setIsLocating(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/auth?redirect=/checkout');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    if (!phone.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/restaurants');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          restaurant_id: restaurantId!,
          delivery_address: address,
          delivery_latitude: currentLocation?.lat || null,
          delivery_longitude: currentLocation?.lng || null,
          special_instructions: specialInstructions || null,
          subtotal,
          delivery_fee: deliveryFee,
          tax,
          total,
          status: 'pending',
          estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          amount: total,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
        });

      if (paymentError) throw paymentError;

      // Clear cart and redirect to order tracking
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/${order.id}`);
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="pt-24 pb-16 min-h-screen">
          <div className="container mx-auto px-4 text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-2xl mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add items to start checkout</p>
            <Link to="/restaurants">
              <Button className="bg-gradient-hero hover:opacity-90">Browse Restaurants</Button>
            </Link>
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
            className="flex items-center gap-4 mb-8"
          >
            <Link to="/cart">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Checkout</h1>
              <p className="text-sm text-muted-foreground">
                From {restaurantName}
              </p>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Delivery Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Delivery Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h2 className="font-display font-semibold text-lg">Delivery Address</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mb-3 gap-2"
                        onClick={detectLocation}
                        disabled={isLocating}
                      >
                        <Navigation className="w-4 h-4" />
                        {isLocating ? 'Detecting location...' : 'Use My Current Location'}
                      </Button>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Full Address *</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your complete delivery address"
                        required
                        className="mt-1.5"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Special Instructions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
                >
                  <h2 className="font-display font-semibold text-lg mb-4">Special Instructions</h2>
                  <Textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special delivery instructions? (Optional)"
                    rows={2}
                  />
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Banknote className="w-5 h-5 text-primary" />
                    <h2 className="font-display font-semibold text-lg">Payment Method</h2>
                  </div>
                  
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:border-primary transition-colors cursor-pointer bg-secondary/30">
                        <RadioGroupItem value="cash_on_delivery" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                <Banknote className="w-5 h-5 text-success" />
                              </div>
                              <div>
                                <p className="font-medium">Cash on Delivery</p>
                                <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                              </div>
                            </div>
                            <CheckCircle className={`w-5 h-5 ${paymentMethod === 'cash_on_delivery' ? 'text-primary' : 'text-muted'}`} />
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </motion.div>
              </div>

              {/* Order Summary */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 sticky top-24"
                >
                  <h3 className="font-display font-semibold text-lg mb-4">Order Summary</h3>
                  
                  {/* Items */}
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-secondary/50 flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Estimated delivery: 35-45 min</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6 bg-gradient-hero hover:opacity-90 h-12 text-base font-semibold gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Placing Order...'
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Place Order - ${total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
