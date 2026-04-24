import { StatusBadge } from '@/components/ui/status-badge';
import type { EnrichedAudit } from '@/lib/types';

export function TimelineList({ items }: { items: EnrichedAudit[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={item.log_id} className="grid grid-cols-[96px_28px_minmax(0,1fr)] gap-4 pb-5">
          <div>
            <div className="text-sm font-medium text-slate-700">{item.date_label}</div>
            <div className="text-sm text-slate-400">{item.time_label}</div>
          </div>
          <div className="relative flex justify-center">
            <span
              className="relative z-10 mt-1 h-3.5 w-3.5 rounded-full border-4 border-white"
              style={{ backgroundColor: item.new_display_status === 'Released' ? '#28B264' : item.new_display_status === 'On Hold' ? '#F2B31B' : item.new_display_status === 'Reject' ? '#E55353' : '#2F6EF2' }}
            />
            {index !== items.length - 1 ? <span className="absolute top-4 h-full w-px bg-slate-200" /> : null}
          </div>
          <div>
            <div className="text-base font-semibold text-slate-900">{item.item_name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>{item.batch_id}</span>
              <span>•</span>
              <span>{item.location_slot}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
              <StatusBadge status={item.previous_display_status} />
              <span className="text-slate-400">→</span>
              <StatusBadge status={item.new_display_status} />
              <span className="text-slate-400">by {item.changed_by}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
