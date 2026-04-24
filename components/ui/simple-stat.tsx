import { compactNumber } from '@/lib/format';
import { AppIcon } from '@/components/ui/icon';

type SimpleStatProps = {
  label: string;
  value: number;
  description: string;
  icon: string;
  accent?: string;
  surface?: string;
};

export function SimpleStat({
  label,
  value,
  description,
  icon,
  accent = '#2F6EF2',
  surface = '#EEF4FF',
}: SimpleStatProps) {
  return (
    <article className="app-card-soft p-4">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ backgroundColor: surface, color: accent }}>
          <AppIcon name={icon} className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="mt-1 text-[24px] font-semibold tracking-tight text-slate-900">{compactNumber(value)}</div>
          <div className="mt-1 text-sm text-slate-500">{description}</div>
        </div>
      </div>
    </article>
  );
}
