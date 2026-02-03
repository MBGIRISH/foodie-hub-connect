import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, CartItem as CartItemType } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/currency';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex gap-4 p-4 bg-card rounded-xl border border-border/50"
    >
      {/* Image */}
      {item.image && (
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{item.name}</h3>
        <p className="text-lg font-semibold text-primary mt-1">
          {formatCurrency(item.price * item.quantity)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full"
              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="font-semibold w-6 text-center">{item.quantity}</span>
            <Button
              size="icon"
              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => removeItem(item.menuItemId)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
