import type { CostData, PacketDefinition } from './types';

export const CURRENCY = 'LKR';
export const PRECISION_OPTS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export const SESSION_STORAGE_KEY = 'costpro_v6_session';
export const HISTORY_STORAGE_KEY = 'costpro_v6_history';

export const DEFAULT_PACKETS: PacketDefinition[] = [
  { id: 'p1', label: '50g', weightKg: '0.05', emptyPacketPrice: '0' },
  { id: 'p2', label: '100g', weightKg: '0.1', emptyPacketPrice: '0' },
  { id: 'p3', label: '250g', weightKg: '0.25', emptyPacketPrice: '0' },
  { id: 'p4', label: '500g', weightKg: '0.5', emptyPacketPrice: '0' },
  { id: 'p5', label: '1kg', weightKg: '1', emptyPacketPrice: '0' },
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const createDefaultCostData = (): CostData => ({
  id: generateId(),
  date: new Date().toISOString().split('T')[0],
  productName: '',
  rawMaterial: {
    originalPricePerKg: '0',
    revisedPricePerKg: '0',
    wastage: '0',
  },
  processing: {
    grinding: '0',
    steaming: '0',
    drying: '0',
    labour: '0',
    electricity: '0',
    other: '0',
  },
  common: { stickerPrice: '0' },
  packetDefinitions: DEFAULT_PACKETS,
  profitMargin: '0',
});

export const createId = generateId;
