import { Pencil, Trash2 } from 'lucide-react';
import type { CostData } from '../types';

interface HistoryPanelProps {
  items: CostData[];
  onLoad: (item: CostData) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onRename: (id: string, productName: string) => void;
}

export const HistoryPanel = ({ items, onLoad, onDelete, onClear, onRename }: HistoryPanelProps) => {
  if (items.length === 0) {
    return <p className="rounded-xl bg-white p-3 text-sm text-slate-600">No history yet.</p>;
  }

  return (
    <div className="mb-4 rounded-2xl bg-slate-100 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">History</p>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl bg-red-50 px-3 py-1 text-xs font-bold text-red-600"
        >
          Clear All
        </button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="mb-2 flex items-center justify-between rounded-xl bg-white p-2 shadow-sm">
          <button type="button" className="text-left" onClick={() => onLoad(item)}>
            <p className="text-xs font-bold">{item.productName || 'Unnamed'}</p>
            <p className="text-[11px] text-slate-500">{item.date}</p>
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const nextName = window.prompt('Rename history item', item.productName);
                if (nextName !== null) {
                  onRename(item.id, nextName);
                }
              }}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label={`Rename ${item.productName}`}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              aria-label={`Delete ${item.productName}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
