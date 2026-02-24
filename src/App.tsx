import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, 
  Coins, 
  Cpu, 
  Calculator, 
  Printer, 
  Plus, 
  TrendingUp,
  Zap,
  Users,
  Layers,
  Save,
  Trash2,
  History,
  Percent
} from 'lucide-react';

// --- Interfaces ---
interface PacketDefinition {
  id: string;
  label: string;
  multiplier: number;
  emptyPacketPrice: number;
}

interface RawMaterial {
  originalPricePerKg: number;
  revisedPricePerKg: number;
  wastage: number;
}

interface ProcessingCosts {
  grinding: number;
  steaming: number;
  drying: number;
  labour: number;
  electricity: number;
  other: number;
}

interface CommonCosts {
  stickerPrice: number;
}

interface CostData {
  id: string;
  date: string;
  productName: string;
  rawMaterial: RawMaterial;
  processing: ProcessingCosts;
  common: CommonCosts;
  packetDefinitions: PacketDefinition[]; 
  profitMargin: number;
}

interface CalculatedPacket {
  id: string;
  label: string;
  costPrice: number;
  sellingPrice: number;
  multiplier: number;
  emptyPacketPrice: number;
}

const CURRENCY = "LKR";
const PRECISION_OPTS = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const DEFAULT_PACKETS: PacketDefinition[] = [
  { id: 'p1', label: '50g', multiplier: 0.05, emptyPacketPrice: 0 },
  { id: 'p2', label: '100g', multiplier: 0.1, emptyPacketPrice: 0 },
  { id: 'p3', label: '250g', multiplier: 0.25, emptyPacketPrice: 0 },
  { id: 'p4', label: '500g', multiplier: 0.5, emptyPacketPrice: 0 },
  { id: 'p5', label: '1kg', multiplier: 1.0, emptyPacketPrice: 0 },
];

const InputField = ({ label, value, onChange, type = "number", icon: Icon, placeholder = "0.00", step = "0.0001" }: any) => (
  <div className="mb-4 text-left">
    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-blue-500" />}
      {label}
    </label>
    <input
      type={type}
      step={step}
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium"
    />
  </div>
);

const SectionCard = ({ title, icon: Icon, children, subtotal }: any) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
    <div className="flex items-center justify-between mb-4 text-left">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Icon size={20} /></div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      {subtotal !== undefined && (
        <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-full">
          Sub: {CURRENCY} {subtotal.toLocaleString(undefined, PRECISION_OPTS)}
        </span>
      )}
    </div>
    {children}
  </div>
);

const App: React.FC = () => {
  const [data, setData] = useState<CostData>(() => {
    const saved = localStorage.getItem('costpro_v5_session');
    return saved ? JSON.parse(saved) : {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      productName: '',
      rawMaterial: { originalPricePerKg: 0, revisedPricePerKg: 0, wastage: 0 },
      processing: { grinding: 0, steaming: 0, drying: 0, labour: 0, electricity: 0, other: 0 },
      common: { stickerPrice: 0 },
      packetDefinitions: DEFAULT_PACKETS,
      profitMargin: 0
    };
  });

  const [savedItems, setSavedItems] = useState<CostData[]>(() => {
    const saved = localStorage.getItem('costpro_v5_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [isPrinting, setIsPrinting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { localStorage.setItem('costpro_v5_session', JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem('costpro_v5_history', JSON.stringify(savedItems)); }, [savedItems]);

  const effectiveRawCost = useMemo(() => {
    const price = Number(data.rawMaterial.revisedPricePerKg) || 0;
    const wastage = (Number(data.rawMaterial.wastage) || 0) / 100;
    return wastage >= 1 ? price : price / (1 - wastage);
  }, [data.rawMaterial.revisedPricePerKg, data.rawMaterial.wastage]);

  const processingSubtotal = useMemo(() => Object.values(data.processing).reduce((a, b) => Number(a) + Number(b), 0), [data.processing]);
  const totalCost1kg = useMemo(() => effectiveRawCost + processingSubtotal + (Number(data.common.stickerPrice) || 0), [effectiveRawCost, processingSubtotal, data.common.stickerPrice]);
  const sellingPrice1kg = useMemo(() => totalCost1kg * (1 + (Number(data.profitMargin) || 0) / 100), [totalCost1kg, data.profitMargin]);

  const calculatedPackets: CalculatedPacket[] = useMemo(() => {
    return data.packetDefinitions.map(p => ({
      id: p.id,
      label: p.label,
      costPrice: (totalCost1kg * p.multiplier) + Number(p.emptyPacketPrice),
      sellingPrice: (sellingPrice1kg * p.multiplier) + Number(p.emptyPacketPrice),
      multiplier: p.multiplier,
      emptyPacketPrice: p.emptyPacketPrice
    }));
  }, [totalCost1kg, sellingPrice1kg, data.packetDefinitions]);

  const handleInputChange = (section: keyof CostData, field: string, value: any) => {
    setData(prev => ({ ...prev, [section]: typeof prev[section] === 'object' ? { ...prev[section] as any, [field]: value } : value }));
  };

  const saveToHistory = () => {
    if (!data.productName) return alert("Please enter a product name.");
    setSavedItems([{ ...data, id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] }, ...savedItems]);
    alert("Saved!");
  };

  const loadHistoryItem = (item: CostData) => {
    setData(item);
    setShowHistory(false);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => { window.print(); setIsPrinting(false); }, 500);
  };

  if (isPrinting) {
    return (
      <div className="p-10 bg-white min-h-screen text-gray-900 text-left">
        <h1 className="text-4xl font-black uppercase mb-2 border-b-8 border-gray-900 pb-4">Cost Report: {data.productName}</h1>
        <table className="w-full mb-10 border-collapse">
          <thead><tr className="bg-gray-900 text-white text-left"><th className="p-3">Category</th><th className="p-3 text-right">LKR</th></tr></thead>
          <tbody>
            <tr className="border-b"><td className="p-3">Raw Material</td><td className="p-3 text-right">{effectiveRawCost.toFixed(2)}</td></tr>
            <tr className="border-b"><td className="p-3">Processing</td><td className="p-3 text-right">{processingSubtotal.toFixed(2)}</td></tr>
            <tr className="bg-blue-50 font-black"><td className="p-3">Total (1kg)</td><td className="p-3 text-right">{totalCost1kg.toFixed(2)}</td></tr>
          </tbody>
        </table>
        <h2 className="text-lg font-black uppercase mb-4">Packet Pricing</h2>
        {calculatedPackets.map(p => (
          <div key={p.id} className="flex justify-between border-b py-2 font-bold"><span>{p.label}</span><span>{CURRENCY} {p.sellingPrice.toFixed(2)}</span></div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 max-w-md mx-auto shadow-2xl overflow-x-hidden">
      <header className="bg-white px-6 pt-8 pb-6 border-b sticky top-0 z-10 text-left">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black flex items-center gap-2"><Calculator className="text-blue-600" /> CostPro V5</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowHistory(!showHistory)} className="p-3 bg-slate-100 rounded-2xl"><History size={20} /></button>
            <button onClick={handlePrint} className="p-3 bg-blue-600 text-white rounded-2xl"><Printer size={20} /></button>
          </div>
        </div>
        {showHistory && (
          <div className="mb-4 p-4 bg-slate-100 rounded-2xl">
            {savedItems.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-xl mb-2 shadow-sm">
                <div className="cursor-pointer" onClick={() => loadHistoryItem(item)}>
                  <p className="font-bold text-xs">{item.productName || 'Unnamed'}</p>
                </div>
                <button onClick={() => setSavedItems(savedItems.filter(i => i.id !== item.id))} className="text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
        <InputField label="Product Name" value={data.productName} type="text" onChange={(val: any) => handleInputChange('productName', '', val)} icon={Package} />
      </header>
      <main className="px-5 mt-8">
        <SectionCard title="Raw Material" icon={Coins}>
          <InputField label="Price / kg" value={data.rawMaterial.revisedPricePerKg} onChange={(val: any) => handleInputChange('rawMaterial', 'revisedPricePerKg', val)} icon={TrendingUp} />
          <InputField label="Wastage (%)" value={data.rawMaterial.wastage} onChange={(val: any) => handleInputChange('rawMaterial', 'wastage', val)} icon={Percent} />
        </SectionCard>
        <SectionCard title="Processing Costs" icon={Cpu} subtotal={processingSubtotal}>
          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Grinding" value={data.processing.grinding} onChange={(val: any) => handleInputChange('processing', 'grinding', val)} icon={Layers} />
            <InputField label="Labour" value={data.processing.labour} onChange={(val: any) => handleInputChange('processing', 'labour', val)} icon={Users} />
            <InputField label="Electricity" value={data.processing.electricity} onChange={(val: any) => handleInputChange('processing', 'electricity', val)} icon={Zap} />
          </div>
        </SectionCard>
        <SectionCard title="Profit Margin" icon={Plus}>
          <div className="mt-4 pt-4 text-left">
            <span className="text-sm font-bold block mb-2">Margin: {data.profitMargin}%</span>
            <input type="range" min="0" max="100" value={data.profitMargin} onChange={(e) => handleInputChange('profitMargin', '', Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>
        </SectionCard>
        <div className="bg-slate-900 rounded-[3rem] p-8 text-white text-left">
          <h3 className="text-4xl font-black mb-6">{CURRENCY} {sellingPrice1kg.toLocaleString(undefined, PRECISION_OPTS)}</h3>
          <div className="space-y-4">
            {calculatedPackets.map((p) => (
              <div key={p.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
                <span className="font-bold">{p.label}</span>
                <span className="text-xl font-black text-green-400">{CURRENCY} {p.sellingPrice.toLocaleString(undefined, PRECISION_OPTS)}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={saveToHistory} className="w-full mt-6 bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2"><Save size={20} /> Save Progress</button>
      </main>
    </div>
  );
};

export default App;