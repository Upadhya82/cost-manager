import type { CostData, PacketDefinition } from '../types';
import { toNumber } from './calculations';

export interface ValidationResult {
  errors: string[];
}

const isEmpty = (value: string): boolean => value.trim().length === 0;

const isInvalidNumber = (value: string): boolean => {
  if (isEmpty(value)) {
    return true;
  }

  return Number.isNaN(Number(value));
};

const validatePacket = (packet: PacketDefinition, index: number): string[] => {
  const errors: string[] = [];
  const packetLabel = packet.label.trim() || `Packet ${index + 1}`;

  if (isEmpty(packet.label)) {
    errors.push(`${packetLabel}: label is required.`);
  }

  if (isInvalidNumber(packet.weightKg)) {
    errors.push(`${packetLabel}: weight must be a valid number.`);
  } else if (toNumber(packet.weightKg) <= 0) {
    errors.push(`${packetLabel}: weight must be greater than 0.`);
  }

  if (isInvalidNumber(packet.emptyPacketPrice)) {
    errors.push(`${packetLabel}: packet cost must be a valid number.`);
  } else if (toNumber(packet.emptyPacketPrice) < 0) {
    errors.push(`${packetLabel}: packet cost cannot be negative.`);
  }

  return errors;
};

const validateNonNegative = (label: string, value: string): string[] => {
  if (isInvalidNumber(value)) {
    return [`${label} must be a valid number.`];
  }

  if (toNumber(value) < 0) {
    return [`${label} cannot be negative.`];
  }

  return [];
};

export const validateCostData = (data: CostData): ValidationResult => {
  const errors: string[] = [];

  if (isEmpty(data.productName)) {
    errors.push('Product name is required.');
  }

  errors.push(...validateNonNegative('Original raw material price', data.rawMaterial.originalPricePerKg));
  errors.push(...validateNonNegative('Revised raw material price', data.rawMaterial.revisedPricePerKg));

  if (isInvalidNumber(data.rawMaterial.wastage)) {
    errors.push('Wastage must be a valid number.');
  } else {
    const wastage = toNumber(data.rawMaterial.wastage);
    if (wastage < 0) {
      errors.push('Wastage cannot be negative.');
    }
    if (wastage >= 100) {
      errors.push('Wastage must be less than 100%.');
    }
  }

  errors.push(...validateNonNegative('Grinding cost', data.processing.grinding));
  errors.push(...validateNonNegative('Steaming cost', data.processing.steaming));
  errors.push(...validateNonNegative('Drying cost', data.processing.drying));
  errors.push(...validateNonNegative('Labour cost', data.processing.labour));
  errors.push(...validateNonNegative('Electricity cost', data.processing.electricity));
  errors.push(...validateNonNegative('Other processing cost', data.processing.other));
  errors.push(...validateNonNegative('Sticker cost', data.common.stickerPrice));

  if (isInvalidNumber(data.profitMargin)) {
    errors.push('Profit margin must be a valid number.');
  } else if (toNumber(data.profitMargin) < 0) {
    errors.push('Profit margin cannot be negative.');
  }

  if (data.packetDefinitions.length === 0) {
    errors.push('At least one packet definition is required.');
  }

  data.packetDefinitions.forEach((packet, index) => {
    errors.push(...validatePacket(packet, index));
  });

  return { errors };
};
