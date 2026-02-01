import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { useCartStore } from '@/stores/cartStore';

export default function CartPage() {
  const { items, clearCart, restaurantName } = useCartStore();

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
              <Link to="/restaurants">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">
                  Your Cart
                </h1>
                {restaurantName && items.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    From {restaurantName}
                  </p>
                )}
              </div>
            </div>

            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                onClick={() => {
                  if (window.confirm('Clear all items from cart?')) {
                    clearCart();
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </Button>
            )}
          </motion.div>

          {items.length === 0 ? (
            <CartSummary />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>

                {/* Add more items link */}
                {restaurantName && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="pt-4"
                  >
                    <Link to={`/restaurant/${items[0]?.restaurantId}`}>
                      <Button variant="outline" className="w-full">
                        + Add more items from {restaurantName}
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <CartSummary />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
