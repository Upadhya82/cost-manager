import { describe, expect, it } from 'vitest';
import { createDefaultCostData } from '../constants';
import { getCalculatedPackets, getEffectiveRawCost, getProcessingSubtotal, getSellingPrice1kg, getTotalCost1kg } from './calculations';

describe('calculations', () => {
  it('computes total and selling prices from raw, processing, common and margin', () => {
    const data = createDefaultCostData();
    data.rawMaterial.revisedPricePerKg = '1200';
    data.rawMaterial.wastage = '10';
    data.processing.grinding = '100';
    data.processing.steaming = '50';
    data.processing.drying = '75';
    data.processing.labour = '25';
    data.processing.electricity = '30';
    data.processing.other = '20';
    data.common.stickerPrice = '15';
    data.profitMargin = '20';

    expect(getEffectiveRawCost(data)).toBeCloseTo(1333.3333, 3);
    expect(getProcessingSubtotal(data)).toBe(300);
    expect(getTotalCost1kg(data)).toBeCloseTo(1648.3333, 3);
    expect(getSellingPrice1kg(data)).toBeCloseTo(1978, 0);
  });

  it('calculates per-packet selling values including packet cost', () => {
    const data = createDefaultCostData();
    data.rawMaterial.revisedPricePerKg = '1000';
    data.profitMargin = '10';
    data.packetDefinitions = [
      { id: 'a', label: '100g', weightKg: '0.1', emptyPacketPrice: '5' },
    ];

    const packets = getCalculatedPackets(data);
    expect(packets).toHaveLength(1);
    expect(packets[0].costPrice).toBeCloseTo(105, 2);
    expect(packets[0].sellingPrice).toBeCloseTo(115, 2);
  });
});
