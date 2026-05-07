import type { CalculatedPacket, CostData, PacketDefinition } from '../types';

export const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toNonNegative = (value: string): number => Math.max(0, toNumber(value));

export const getEffectiveRawCost = (data: CostData): number => {
  const revised = toNonNegative(data.rawMaterial.revisedPricePerKg);
  const wastage = toNonNegative(data.rawMaterial.wastage) / 100;

  if (wastage >= 1) {
    return revised;
  }

  return revised / (1 - wastage);
};

export const getProcessingSubtotal = (data: CostData): number => {
  return Object.values(data.processing).reduce((sum, value) => sum + toNonNegative(value), 0);
};

export const getTotalCost1kg = (data: CostData): number => {
  return getEffectiveRawCost(data) + getProcessingSubtotal(data) + toNonNegative(data.common.stickerPrice);
};

export const getSellingPrice1kg = (data: CostData): number => {
  const totalCost1kg = getTotalCost1kg(data);
  const margin = toNonNegative(data.profitMargin) / 100;
  return totalCost1kg * (1 + margin);
};

export const getPacketCost = (
  packet: PacketDefinition,
  totalCost1kg: number,
  sellingPrice1kg: number,
): CalculatedPacket => {
  const weightKg = toNonNegative(packet.weightKg);
  const emptyPacketPrice = toNonNegative(packet.emptyPacketPrice);

  return {
    id: packet.id,
    label: packet.label || `${weightKg * 1000}g`,
    weightKg,
    emptyPacketPrice,
    costPrice: totalCost1kg * weightKg + emptyPacketPrice,
    sellingPrice: sellingPrice1kg * weightKg + emptyPacketPrice,
  };
};

export const getCalculatedPackets = (data: CostData): CalculatedPacket[] => {
  const totalCost1kg = getTotalCost1kg(data);
  const sellingPrice1kg = getSellingPrice1kg(data);

  return data.packetDefinitions.map((packet) => getPacketCost(packet, totalCost1kg, sellingPrice1kg));
};
