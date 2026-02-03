import { motion } from 'framer-motion';
import { Plus, Minus, Leaf, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/currency';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
}

export function MenuItemCard({ item, restaurantId, restaurantName }: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url || undefined,
      restaurantId,
      restaurantName,
    });
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-4 bg-card rounded-xl border border-border/50 hover:shadow-md transition-shadow"
    >
      {/* Image */}
      {item.image_url && (
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base truncate">{item.name}</h3>
              {item.is_vegetarian && (
                <Badge variant="outline" className="badge-veg gap-1 text-xs">
                  <Leaf className="w-3 h-3" />
                  Veg
                </Badge>
              )}
              {item.is_spicy && (
                <Badge variant="outline" className="badge-spicy gap-1 text-xs">
                  <Flame className="w-3 h-3" />
                  Spicy
                </Badge>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="font-semibold text-lg">{formatCurrency(item.price)}</span>

          {/* Add/Quantity controls */}
          {quantity === 0 ? (
            <Button
              onClick={handleAdd}
              size="sm"
              className="bg-gradient-hero hover:opacity-90 text-white gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleUpdateQuantity(quantity - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-semibold w-6 text-center">{quantity}</span>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                onClick={() => handleUpdateQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
