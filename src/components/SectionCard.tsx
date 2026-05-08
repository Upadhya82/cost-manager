import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CURRENCY, PRECISION_OPTS } from '../constants';

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  subtotal?: number;
}

export const SectionCard = ({ title, icon: Icon, children, subtotal }: SectionCardProps) => {
  return (
    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Icon size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        {subtotal !== undefined ? (
          <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
            Sub: {CURRENCY} {subtotal.toLocaleString(undefined, PRECISION_OPTS)}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
};
