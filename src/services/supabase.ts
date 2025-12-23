// Dummy in-memory backend to replace Supabase for local development.
// Exports the same types and functions used by the components.

export interface DiningTable {
  id: string;
  table_number: number;
  row_position: number;
  pair_position: number;
  position_in_row: number;
}

export interface Chair {
  id: string;
  table_id: string;
  position: number;
  side: string;
  is_occupied: boolean;
}

export interface TableWithChairs extends DiningTable {
  chairs: Chair[];
}

// Create deterministic mock data: 6 rows x 4 tables = 24 tables, each with 8 chairs (4 top, 4 bottom)
const TABLE_COUNT = 24;

const createMockData = (): TableWithChairs[] => {
  const tables: TableWithChairs[] = [];
  for (let i = 0; i < TABLE_COUNT; i++) {
    const tableNumber = i + 1;
    const row_position = Math.floor(i / 4);
    const pair_position = (i % 2 === 0) ? 0 : 1;
    const position_in_row = i % 4;
    const tableId = `table-${tableNumber}`;

    const chairs: Chair[] = [];
    // top chairs (positions 0..3)
    for (let p = 0; p < 4; p++) {
      chairs.push({
        id: `${tableId}-top-${p}`,
        table_id: tableId,
        position: p,
        side: 'top',
        is_occupied: false,
      });
    }
    // bottom chairs (positions 0..3)
    for (let p = 0; p < 4; p++) {
      chairs.push({
        id: `${tableId}-bottom-${p}`,
        table_id: tableId,
        position: p,
        side: 'bottom',
        is_occupied: false,
      });
    }

    tables.push({
      id: tableId,
      table_number: tableNumber,
      row_position,
      pair_position,
      position_in_row,
      chairs,
    });
  }
  return tables;
};

// In-memory state (mutable) used by the dummy backend
let tablesState: TableWithChairs[] = createMockData();

type Subscriber = (updatedChairs: Chair[]) => void;
const subscribers: Subscriber[] = [];

export async function fetchAllTables(): Promise<TableWithChairs[]> {
  // return a deep copy to avoid accidental external mutation
  return JSON.parse(JSON.stringify(tablesState)) as TableWithChairs[];
}

export async function updateChairOccupancy(chairId: string, isOccupied: boolean): Promise<void> {
  let updated: Chair | null = null;
  for (const table of tablesState) {
    const chair = table.chairs.find(c => c.id === chairId);
    if (chair) {
      chair.is_occupied = isOccupied;
      updated = { ...chair };
      break;
    }
  }

  if (!updated) {
    throw new Error(`Chair with id ${chairId} not found`);
  }

  // notify subscribers with a shallow copy
  subscribers.forEach(cb => cb([ { ...updated! } ]));
}

export function subscribeToChairUpdates(callback: (updatedChairs: Chair[]) => void): (() => void) {
  subscribers.push(callback);
  return () => {
    const idx = subscribers.indexOf(callback);
    if (idx !== -1) subscribers.splice(idx, 1);
  };
}

export function getOccupiedChairsCount(tables: TableWithChairs[]): number {
  return tables.reduce((count, table) => {
    return count + table.chairs.filter(chair => chair.is_occupied).length;
  }, 0);
}

export function getTotalChairsCount(tables: TableWithChairs[]): number {
  return tables.reduce((count, table) => {
    return count + table.chairs.length;
  }, 0);
}
