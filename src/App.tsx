import { useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  Coins,
  Cpu,
  History,
  Package,
  Percent,
  Printer,
  Save,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import {
  CURRENCY,
  HISTORY_STORAGE_KEY,
  PRECISION_OPTS,
  SESSION_STORAGE_KEY,
  createDefaultCostData,
  createId,
} from './constants';
import { HistoryPanel } from './components/HistoryPanel';
import { InputField } from './components/InputField';
import { PacketManager } from './components/PacketManager';
import { SectionCard } from './components/SectionCard';
import type { CostData } from './types';
import {
  getCalculatedPackets,
  getEffectiveRawCost,
  getProcessingSubtotal,
  getSellingPrice1kg,
  getTotalCost1kg,
  toNumber,
} from './utils/calculations';
import { readCostData, readHistory, writeStorage } from './utils/storage';
import { validateCostData } from './utils/validation';

const PRINT_PREPARE_DELAY_MS = 200;

const App = () => {
  const [data, setData] = useState<CostData>(() => readCostData(SESSION_STORAGE_KEY).value);
  const [savedItems, setSavedItems] = useState<CostData[]>(() => readHistory(HISTORY_STORAGE_KEY).value);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [storageError, setStorageError] = useState<string | null>(() => {
    const sessionError = readCostData(SESSION_STORAGE_KEY).error;
    const historyError = readHistory(HISTORY_STORAGE_KEY).error;
    return sessionError ?? historyError;
  });

  useEffect(() => {
    const writeError = writeStorage(SESSION_STORAGE_KEY, data);
    if (writeError) {
      setStorageError(writeError);
    }
  }, [data]);

  useEffect(() => {
    const writeError = writeStorage(HISTORY_STORAGE_KEY, savedItems);
    if (writeError) {
      setStorageError(writeError);
    }
  }, [savedItems]);

  const effectiveRawCost = useMemo(() => getEffectiveRawCost(data), [data]);
  const processingSubtotal = useMemo(() => getProcessingSubtotal(data), [data]);
  const totalCost1kg = useMemo(() => getTotalCost1kg(data), [data]);
  const sellingPrice1kg = useMemo(() => getSellingPrice1kg(data), [data]);
  const calculatedPackets = useMemo(() => getCalculatedPackets(data), [data]);

  const updateData = <K extends keyof CostData>(section: K, value: CostData[K]) => {
    setData((prev) => ({ ...prev, [section]: value }));
  };

  const updateRawMaterial = (field: keyof CostData['rawMaterial'], value: string) => {
    setData((prev) => ({ ...prev, rawMaterial: { ...prev.rawMaterial, [field]: value } }));
  };

  const updateProcessing = (field: keyof CostData['processing'], value: string) => {
    setData((prev) => ({ ...prev, processing: { ...prev.processing, [field]: value } }));
  };

  const updateCommon = (field: keyof CostData['common'], value: string) => {
    setData((prev) => ({ ...prev, common: { ...prev.common, [field]: value } }));
  };

  const handlePacketChange = (id: string, field: 'label' | 'weightKg' | 'emptyPacketPrice', value: string) => {
    setData((prev) => ({
      ...prev,
      packetDefinitions: prev.packetDefinitions.map((packet) =>
        packet.id === id ? { ...packet, [field]: value } : packet,
      ),
    }));
  };

  const handlePacketAdd = () => {
    setData((prev) => ({
      ...prev,
      packetDefinitions: [
        ...prev.packetDefinitions,
        {
          id: createId(),
          label: '',
          weightKg: '0',
          emptyPacketPrice: '0',
        },
      ],
    }));
  };

  const handlePacketRemove = (id: string) => {
    setData((prev) => ({
      ...prev,
      packetDefinitions: prev.packetDefinitions.filter((packet) => packet.id !== id),
    }));
  };

  const saveToHistory = () => {
    const validation = validateCostData(data);
    setErrors(validation.errors);

    if (validation.errors.length > 0) {
      return;
    }

    const saveItem = {
      ...data,
      id: createId(),
      date: new Date().toISOString().split('T')[0],
      productName: data.productName.trim(),
    };

    setSavedItems((prev) => [saveItem, ...prev]);
    setErrors([]);
  };

  const handleDeleteHistory = (id: string) => {
    if (!window.confirm('Delete this history item?')) {
      return;
    }

    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (!window.confirm('Clear all history items?')) {
      return;
    }

    setSavedItems([]);
  };

  const handleRenameHistory = (id: string, productName: string) => {
    const trimmed = productName.trim();
    if (!trimmed) {
      return;
    }

    setSavedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, productName: trimmed } : item)),
    );
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      try {
        window.print();
      } catch {
        setStorageError('Printing failed on this browser.');
      } finally {
        setIsPrinting(false);
      }
    }, PRINT_PREPARE_DELAY_MS);
  };

  const resetForm = () => {
    const next = createDefaultCostData();
    updateData('id', next.id);
    updateData('date', next.date);
    updateData('productName', next.productName);
    updateData('rawMaterial', next.rawMaterial);
    updateData('processing', next.processing);
    updateData('common', next.common);
    updateData('packetDefinitions', next.packetDefinitions);
    updateData('profitMargin', next.profitMargin);
    setErrors([]);
  };

  if (isPrinting) {
    return (
      <div className="min-h-screen bg-white p-10 text-left text-gray-900">
        <h1 className="mb-2 border-b-8 border-gray-900 pb-4 text-4xl font-black uppercase">
          Cost Report: {data.productName || 'Unnamed'}
        </h1>
        <table className="mb-10 w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-left text-white">
              <th className="p-3">Category</th>
              <th className="p-3 text-right">{CURRENCY}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">Raw Material</td>
              <td className="p-3 text-right">{effectiveRawCost.toFixed(2)}</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Processing</td>
              <td className="p-3 text-right">{processingSubtotal.toFixed(2)}</td>
            </tr>
            <tr className="bg-blue-50 font-black">
              <td className="p-3">Total (1kg)</td>
              <td className="p-3 text-right">{totalCost1kg.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <h2 className="mb-4 text-lg font-black uppercase">Packet Pricing</h2>
        {calculatedPackets.map((packet) => (
          <div key={packet.id} className="flex justify-between border-b py-2 font-bold">
            <span>{packet.label}</span>
            <span>
              {CURRENCY} {packet.sellingPrice.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl bg-slate-50 pb-24 text-slate-900 shadow-2xl">
      <header className="sticky top-0 z-10 border-b bg-white px-6 pb-6 pt-8 text-left">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-black">
            <Calculator className="text-blue-600" /> Cost Manager
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="rounded-2xl bg-slate-100 p-3"
              aria-label="Toggle history"
            >
              <History size={20} />
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-2xl bg-blue-600 p-3 text-white"
              aria-label="Print report"
            >
              <Printer size={20} />
            </button>
          </div>
        </div>

        {showHistory ? (
          <HistoryPanel
            items={savedItems}
            onLoad={(item) => {
              setData(item);
              setShowHistory(false);
            }}
            onDelete={handleDeleteHistory}
            onClear={handleClearHistory}
            onRename={handleRenameHistory}
          />
        ) : null}

        <InputField
          label="Product Name"
          value={data.productName}
          type="text"
          onChange={(value) => updateData('productName', value)}
          icon={Package}
          placeholder="Enter product name"
        />
      </header>

      <main className="mt-8 grid gap-6 px-5 lg:grid-cols-2">
        <div>
          <SectionCard title="Raw Material" icon={Coins}>
            <InputField
              label="Original Price / kg"
              value={data.rawMaterial.originalPricePerKg}
              onChange={(value) => updateRawMaterial('originalPricePerKg', value)}
              icon={TrendingUp}
              min="0"
            />
            <InputField
              label="Revised Price / kg"
              value={data.rawMaterial.revisedPricePerKg}
              onChange={(value) => updateRawMaterial('revisedPricePerKg', value)}
              icon={TrendingUp}
              min="0"
            />
            <InputField
              label="Wastage (%)"
              value={data.rawMaterial.wastage}
              onChange={(value) => updateRawMaterial('wastage', value)}
              icon={Percent}
              min="0"
            />
          </SectionCard>

          <SectionCard title="Processing Costs" icon={Cpu} subtotal={processingSubtotal}>
            <div className="grid grid-cols-2 gap-x-4">
              <InputField
                label="Grinding"
                value={data.processing.grinding}
                onChange={(value) => updateProcessing('grinding', value)}
                icon={Users}
                min="0"
              />
              <InputField
                label="Steaming"
                value={data.processing.steaming}
                onChange={(value) => updateProcessing('steaming', value)}
                icon={Users}
                min="0"
              />
              <InputField
                label="Drying"
                value={data.processing.drying}
                onChange={(value) => updateProcessing('drying', value)}
                icon={Users}
                min="0"
              />
              <InputField
                label="Labour"
                value={data.processing.labour}
                onChange={(value) => updateProcessing('labour', value)}
                icon={Users}
                min="0"
              />
              <InputField
                label="Electricity"
                value={data.processing.electricity}
                onChange={(value) => updateProcessing('electricity', value)}
                icon={Zap}
                min="0"
              />
              <InputField
                label="Other"
                value={data.processing.other}
                onChange={(value) => updateProcessing('other', value)}
                icon={Users}
                min="0"
              />
            </div>
          </SectionCard>

          <SectionCard title="Common Costs" icon={Package}>
            <InputField
              label="Sticker Cost"
              value={data.common.stickerPrice}
              onChange={(value) => updateCommon('stickerPrice', value)}
              min="0"
            />
          </SectionCard>

          <SectionCard title="Profit Margin" icon={Percent}>
            <div className="mt-4 text-left">
              <span className="mb-2 block text-sm font-bold">
                Margin: {toNumber(data.profitMargin).toLocaleString(undefined, PRECISION_OPTS)}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={data.profitMargin}
                onChange={(event) => updateData('profitMargin', event.target.value)}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-100 accent-blue-600"
              />
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Packet Management" icon={Package}>
            <PacketManager
              packets={data.packetDefinitions}
              onPacketChange={handlePacketChange}
              onPacketAdd={handlePacketAdd}
              onPacketRemove={handlePacketRemove}
            />
          </SectionCard>

          <div className="rounded-[2rem] bg-slate-900 p-8 text-left text-white">
            <h3 className="mb-6 text-4xl font-black">
              {CURRENCY} {sellingPrice1kg.toLocaleString(undefined, PRECISION_OPTS)}
            </h3>
            <div className="space-y-4">
              {calculatedPackets.map((packet) => (
                <div key={packet.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                  <span className="font-bold">{packet.label}</span>
                  <span className="text-xl font-black text-green-400">
                    {CURRENCY} {packet.sellingPrice.toLocaleString(undefined, PRECISION_OPTS)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={saveToHistory}
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-black text-white"
              >
                <Save size={20} /> Save Progress
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-white/30 py-4 font-black text-white"
              >
                Reset
              </button>
            </div>
          </div>

          {errors.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
              <p className="mb-2 text-sm font-bold text-red-700">Please fix the following issues:</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {storageError ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
              {storageError}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default App;
