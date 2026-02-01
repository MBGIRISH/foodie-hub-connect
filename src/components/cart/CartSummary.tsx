import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';

interface CartSummaryProps {
  showCheckout?: boolean;
}

export function CartSummary({ showCheckout = true }: CartSummaryProps) {
  const { items, getTotal, restaurantName } = useCartStore();
  const subtotal = getTotal();
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-xl mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-6">
          Add items from a restaurant to get started
        </p>
        <Link to="/restaurants">
          <Button className="bg-gradient-hero hover:opacity-90">
            Browse Restaurants
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-lg border border-border/50"
    >
      <h3 className="font-display font-semibold text-lg mb-4">Order Summary</h3>
      
      {restaurantName && (
        <p className="text-sm text-muted-foreground mb-4">
          From <span className="font-medium text-foreground">{restaurantName}</span>
        </p>
      )}

      <div className="space-y-3">
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

      {showCheckout && (
        <Link to="/checkout">
          <Button className="w-full mt-6 bg-gradient-hero hover:opacity-90 h-12 text-base font-semibold gap-2">
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
