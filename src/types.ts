export interface PacketDefinition {
  id: string;
  label: string;
  weightKg: string;
  emptyPacketPrice: string;
}

export interface RawMaterial {
  originalPricePerKg: string;
  revisedPricePerKg: string;
  wastage: string;
}

export interface ProcessingCosts {
  grinding: string;
  steaming: string;
  drying: string;
  labour: string;
  electricity: string;
  other: string;
}

export interface CommonCosts {
  stickerPrice: string;
}

export interface CostData {
  id: string;
  date: string;
  productName: string;
  rawMaterial: RawMaterial;
  processing: ProcessingCosts;
  common: CommonCosts;
  packetDefinitions: PacketDefinition[];
  profitMargin: string;
}

export interface CalculatedPacket {
  id: string;
  label: string;
  weightKg: number;
  emptyPacketPrice: number;
  costPrice: number;
  sellingPrice: number;
}
