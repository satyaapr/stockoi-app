import { compactNumber, formatPercent } from '@/lib/format';
import { AppIcon } from '@/components/ui/icon';

type KpiTileProps = {
  label: string;
  count: number;
  share: number;
  accent: string;
  surface: string;
  track: string;
  icon: string;
};

export function KpiTile({ label, count, share, accent, surface, track, icon }: KpiTileProps) {
  return (
    <article className="app-card overflow-hidden border p-4" style={{ backgroundColor: surface }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/65 shadow-sm" style={{ color: accent }}>
            <AppIcon name={icon} className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
              {label}
            </div>
            <div className="mt-1 text-[18px] font-semibold text-slate-900 sm:text-[20px]">{compactNumber(count)}</div>
          </div>
        </div>
        <div className="pt-3 text-sm font-semibold text-slate-600">{formatPercent(share)}</div>
      </div>
      <div className="mt-4 h-[4px] rounded-full" style={{ backgroundColor: track }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(share, 5))}%`, backgroundColor: accent }} />
      </div>
    </article>
  );
}
