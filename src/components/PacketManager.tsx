import { Plus, Trash2 } from 'lucide-react';
import type { PacketDefinition } from '../types';

interface PacketManagerProps {
  packets: PacketDefinition[];
  onPacketChange: (id: string, field: 'label' | 'weightKg' | 'emptyPacketPrice', value: string) => void;
  onPacketAdd: () => void;
  onPacketRemove: (id: string) => void;
}

export const PacketManager = ({ packets, onPacketChange, onPacketAdd, onPacketRemove }: PacketManagerProps) => {
  return (
    <div className="space-y-3">
      {packets.map((packet) => (
        <div key={packet.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">Packet</span>
            <button
              type="button"
              onClick={() => onPacketRemove(packet.id)}
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              aria-label={`Remove ${packet.label}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              value={packet.label}
              onChange={(event) => onPacketChange(packet.id, 'label', event.target.value)}
              placeholder="Label (e.g. 250g)"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.001"
              min="0"
              value={packet.weightKg}
              onChange={(event) => onPacketChange(packet.id, 'weightKg', event.target.value)}
              placeholder="Weight (kg)"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={packet.emptyPacketPrice}
              onChange={(event) => onPacketChange(packet.id, 'emptyPacketPrice', event.target.value)}
              placeholder="Packet Cost"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={onPacketAdd}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-blue-300 bg-blue-50 py-3 font-bold text-blue-700"
      >
        <Plus size={16} /> Add Packet
      </button>
    </div>
  );
};
