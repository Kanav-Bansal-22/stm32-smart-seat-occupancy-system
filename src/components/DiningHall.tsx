import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle } from 'lucide-react';
import TablePair from './TablePair';
import {
  fetchAllTables,
  updateChairOccupancy,
  getOccupiedChairsCount,
  getTotalChairsCount,
  TableWithChairs,
} from '../services/supabase';

export default function DiningHall() {
  const [tables, setTables] = useState<TableWithChairs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingChairId, setUpdatingChairId] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  // Poll backend server for updates from ESP32 and apply changes to local tables state.
  // Map ESP chair IDs to frontend chair IDs. Adjust this mapping if your ESP uses different IDs.
  useEffect(() => {
    const espToFrontendMap: Record<string, string> = {
      'chair-1': 'table-1-top-0',
      'chair-2': 'table-1-top-1',
    };

    // reverse lookup: frontendId -> espId
    const frontendToEsp = Object.fromEntries(
      Object.entries(espToFrontendMap).map(([esp, front]) => [front, esp])
    );

    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/chairs');
        if (!res.ok) return;
        const data = await res.json();
        const chairsState: Record<string, { is_occupied: boolean }> = data.chairs || {};

        if (!mounted) return;

        setTables(prevTables =>
          prevTables.map(table => ({
            ...table,
            chairs: table.chairs.map(chair => {
              const espId = frontendToEsp[chair.id];
              if (espId && chairsState[espId] && typeof chairsState[espId].is_occupied === 'boolean') {
                return { ...chair, is_occupied: chairsState[espId].is_occupied };
              }
              return chair;
            }),
          }))
        );
      } catch (err) {
        // silent: don't disrupt UI if polling fails
        // console.debug('Polling error', err);
      }
    };

    // initial poll and then interval
    poll();
    const id = setInterval(poll, 2000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllTables();
      setTables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleChairClick = async (chairId: string, currentStatus: boolean) => {
    try {
      setUpdatingChairId(chairId);
      await updateChairOccupancy(chairId, !currentStatus);

      setTables(prevTables =>
        prevTables.map(table => ({
          ...table,
          chairs: table.chairs.map(chair =>
            chair.id === chairId
              ? { ...chair, is_occupied: !chair.is_occupied }
              : chair
          ),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chair');
    } finally {
      setUpdatingChairId(null);
    }
  };

  const occupiedCount = getOccupiedChairsCount(tables);
  const totalCount = getTotalChairsCount(tables);
  const availableCount = totalCount - occupiedCount;

  const tableRows = [];
  for (let i = 0; i < 6; i++) {
    tableRows.push(tables.slice(i * 4, (i + 1) * 4));
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full flex items-start gap-4">
          <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <h2 className="font-semibold text-red-900 mb-1">Error</h2>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={loadTables}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-6 max-w-3xl mx-auto"
        >
          <div className="flex flex-col items-center gap-3 mb-2">
            <Users size={32} className="text-indigo-700" />
            <h1 className="text-4xl font-bold text-indigo-700 text-center">Dining Hall</h1>
          </div>
          <p className="text-indigo-600 text-center">Mess seating availability at a glance</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-sm font-medium text-slate-600 mb-1">
                Available Seats
              </div>
              <motion.div
                key={availableCount}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold text-green-600"
              >
                {availableCount}
              </motion.div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium text-slate-600 mb-1">
                Occupied Seats
              </div>
              <motion.div
                key={occupiedCount}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold text-blue-600"
              >
                {occupiedCount}
              </motion.div>
            </div>

            <div className="text-center md:col-span-1 col-span-2">
              <div className="text-sm font-medium text-slate-600 mb-1">
                Total Capacity
              </div>
              <div className="text-4xl font-bold text-slate-600">
                {totalCount}
              </div>
            </div>
          </div>

          <div className="mt-4 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(occupiedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>
          <div className="text-xs text-slate-500 mt-2 text-right">
            {((occupiedCount / totalCount) * 100).toFixed(1)}% occupied
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-3 border-slate-300 border-t-slate-900 rounded-full"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-8"
          >
            {tableRows.map((row, rowIndex) => (
              <motion.div
                key={rowIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + rowIndex * 0.1, duration: 0.4 }}
                className="flex flex-wrap gap-32 justify-center"
              >
                {row.slice(0, 2).map((tables, pairIndex) => (
                  <TablePair
                    key={`pair-${rowIndex}-${pairIndex}`}
                    tables={[tables, row[pairIndex + 2] || null].filter(
                      Boolean
                    ) as TableWithChairs[]}
                    onChairClick={handleChairClick}
                    pairIndex={pairIndex}
                  />
                ))}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {updatingChairId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm"
        >
          Updating...
        </motion.div>
      )}
    </div>
  );
}
