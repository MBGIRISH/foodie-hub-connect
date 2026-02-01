import { motion } from 'framer-motion';
import { CUISINE_FILTERS } from '@/types';

interface CuisineFilterProps {
  selected: string;
  onSelect: (cuisine: string) => void;
}

export function CuisineFilter({ selected, onSelect }: CuisineFilterProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
      {CUISINE_FILTERS.map((cuisine) => (
        <motion.button
          key={cuisine.value}
          onClick={() => onSelect(cuisine.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all font-medium text-sm ${
            selected === cuisine.value
              ? 'bg-gradient-hero text-white shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <span className="text-lg">{cuisine.emoji}</span>
          <span>{cuisine.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
