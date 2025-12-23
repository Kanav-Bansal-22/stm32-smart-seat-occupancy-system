import { motion } from 'framer-motion';
import Chair from './Chair';
import { TableWithChairs } from '../services/supabase';

interface DiningTableProps {
  table: TableWithChairs;
  onChairClick: (chairId: string, currentStatus: boolean) => void;
}

export default function DiningTable({ table, onChairClick }: DiningTableProps) {
  const occupiedCount = table.chairs.filter(c => c.is_occupied).length;
  const availableCount = table.chairs.length - occupiedCount;

  const topChairs = table.chairs.filter(c => c.side === 'top').sort((a, b) => a.position - b.position);
  const bottomChairs = table.chairs.filter(c => c.side === 'bottom').sort((a, b) => a.position - b.position);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center"
    >
      <div className="relative px-6 py-16 w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex justify-between items-center w-48 px-2">
            {topChairs.map((chair) => (
              <div key={chair.id} className="relative">
                <Chair
                  chair={chair}
                  position={chair.position}
                  side="top"
                  onClick={() => onChairClick(chair.id, chair.is_occupied)}
                />
              </div>
            ))}
          </div>

          <motion.div
            animate={{
              backgroundColor: availableCount === 0 ? '#fee2e2' : '#f0fdf4',
              borderColor: availableCount === 0 ? '#fca5a5' : '#86efac',
            }}
            transition={{ duration: 0.3 }}
            className="w-64 h-28 rounded-3xl border-2 shadow-lg flex flex-col items-center justify-center bg-white"
          >
            <div className="text-sm font-semibold text-gray-700">
              Table {table.table_number}
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {availableCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              of {table.chairs.length}
            </div>
          </motion.div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex justify-between items-center w-48 px-2">
            {bottomChairs.map((chair) => (
              <div key={chair.id} className="relative">
                <Chair
                  chair={chair}
                  position={chair.position}
                  side="bottom"
                  onClick={() => onChairClick(chair.id, chair.is_occupied)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
