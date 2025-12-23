import { motion } from 'framer-motion';
import DiningTable from './DiningTable';
import { TableWithChairs } from '../services/supabase';

interface TablePairProps {
  tables: TableWithChairs[];
  onChairClick: (chairId: string, currentStatus: boolean) => void;
  pairIndex: number;
}

export default function TablePair({ tables, onChairClick, pairIndex }: TablePairProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: pairIndex * 0.1, duration: 0.4 }}
      className="flex gap-2 md:gap-4 items-center"
    >
      {tables.map(table => (
        <DiningTable
          key={table.id}
          table={table}
          onChairClick={onChairClick}
        />
      ))}
    </motion.div>
  );
}
