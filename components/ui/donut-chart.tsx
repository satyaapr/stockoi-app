import { compactNumber, formatPercent } from '@/lib/format';
import type { DonutSegment } from '@/lib/types';

function gradientFromSegments(segments: DonutSegment[]) {
  let cursor = 0;
  const stops = segments.map((segment) => {
    const start = cursor;
    cursor += segment.share;
    return `${segment.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export function DonutChart({ segments, totalLabel = 'Total' }: { segments: DonutSegment[]; totalLabel?: string }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)] xl:items-center">
      <div className="mx-auto">
        <div
          className="relative h-[220px] w-[220px] rounded-full"
          style={{ backgroundImage: gradientFromSegments(segments) }}
        >
          <div className="absolute inset-[32px] grid place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(226,232,240,0.7)]">
            <div className="text-center">
              <div className="text-[16px] font-semibold text-slate-900 sm:text-[18px]">{compactNumber(total)}</div>
              <div className="text-sm text-slate-500">{totalLabel}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span>{segment.label}</span>
            </div>
            <div className="text-sm text-slate-600">
              {compactNumber(segment.value)} <span className="text-slate-400">({formatPercent(segment.share)})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
