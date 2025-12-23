import { motion } from 'framer-motion';
import { Circle, User } from 'lucide-react';
import { Chair as ChairType } from '../services/supabase';

interface ChairProps {
  chair: ChairType;
  position: number;
  side: string;
  onClick: () => void;
}

// keep `side` in the props type (used by callers) but name it `_side` in the
// parameter destructure to avoid the 'declared but its value is never read' TS error.
export default function Chair({ chair, position, side: _side, onClick }: ChairProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: position * 0.03 }}
      onClick={onClick}
      className=""
      aria-label={`Chair at position ${position}`}
    >
      <motion.div
        animate={{
          backgroundColor: chair.is_occupied ? '#1f2937' : '#e5e7eb',
          boxShadow: chair.is_occupied
            ? '0 0 0 2px #374151, 0 4px 12px rgba(0,0,0,0.15)'
            : '0 0 0 2px #d1d5db, 0 2px 8px rgba(0,0,0,0.08)',
        }}
        transition={{ duration: 0.3 }}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {chair.is_occupied ? (
          <User size={18} className="text-white" />
        ) : (
          <Circle size={14} className="text-gray-400" strokeWidth={2} />
        )}
      </motion.div>
    </motion.button>
  );
}
