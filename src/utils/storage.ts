import { createDefaultCostData, DEFAULT_PACKETS } from '../constants';
import type { CostData, PacketDefinition } from '../types';

interface ReadResult<T> {
  value: T;
  error: string | null;
}

const toStringValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return '0';
};

const normalizePacket = (packet: unknown): PacketDefinition | null => {
  if (!packet || typeof packet !== 'object') {
    return null;
  }

  const source = packet as Record<string, unknown>;
  const legacyMultiplier = source.multiplier;
  const weightKg = source.weightKg ?? legacyMultiplier;

  if (!source.id || typeof source.id !== 'string') {
    return null;
  }

  return {
    id: source.id,
    label: typeof source.label === 'string' ? source.label : '',
    weightKg: toStringValue(weightKg),
    emptyPacketPrice: toStringValue(source.emptyPacketPrice),
  };
};

const normalizeCostData = (value: unknown): CostData => {
  const fallback = createDefaultCostData();
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const source = value as Record<string, unknown>;
  const packetDefinitions = Array.isArray(source.packetDefinitions)
    ? source.packetDefinitions.map((packet) => normalizePacket(packet)).filter((packet): packet is PacketDefinition => packet !== null)
    : [];

  return {
    id: typeof source.id === 'string' ? source.id : fallback.id,
    date: typeof source.date === 'string' ? source.date : fallback.date,
    productName: typeof source.productName === 'string' ? source.productName : '',
    rawMaterial: {
      originalPricePerKg: toStringValue((source.rawMaterial as Record<string, unknown> | undefined)?.originalPricePerKg),
      revisedPricePerKg: toStringValue((source.rawMaterial as Record<string, unknown> | undefined)?.revisedPricePerKg),
      wastage: toStringValue((source.rawMaterial as Record<string, unknown> | undefined)?.wastage),
    },
    processing: {
      grinding: toStringValue((source.processing as Record<string, unknown> | undefined)?.grinding),
      steaming: toStringValue((source.processing as Record<string, unknown> | undefined)?.steaming),
      drying: toStringValue((source.processing as Record<string, unknown> | undefined)?.drying),
      labour: toStringValue((source.processing as Record<string, unknown> | undefined)?.labour),
      electricity: toStringValue((source.processing as Record<string, unknown> | undefined)?.electricity),
      other: toStringValue((source.processing as Record<string, unknown> | undefined)?.other),
    },
    common: {
      stickerPrice: toStringValue((source.common as Record<string, unknown> | undefined)?.stickerPrice),
    },
    packetDefinitions: packetDefinitions.length > 0 ? packetDefinitions : DEFAULT_PACKETS,
    profitMargin: toStringValue(source.profitMargin),
  };
};

export const readCostData = (key: string): ReadResult<CostData> => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return { value: createDefaultCostData(), error: null };
    }

    return { value: normalizeCostData(JSON.parse(stored)), error: null };
  } catch {
    return { value: createDefaultCostData(), error: 'Saved session could not be loaded.' };
  }
};

export const readHistory = (key: string): ReadResult<CostData[]> => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return { value: [], error: null };
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return { value: [], error: 'Saved history format is invalid.' };
    }

    return {
      value: parsed.map((entry) => normalizeCostData(entry)),
      error: null,
    };
  } catch {
    return { value: [], error: 'Saved history could not be loaded.' };
  }
};

export const writeStorage = (key: string, value: unknown): string | null => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return null;
  } catch {
    return 'Unable to save data to local storage.';
  }
};
