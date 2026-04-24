import { ANOMALY_META, RISK_META, STATUS_META } from '@/lib/theme';
import type { DisplayStatus, RiskBucket } from '@/lib/types';

type BadgeProps = {
  label: string;
  accent: string;
  surface: string;
};

function BaseBadge({ label, accent, surface }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
      style={{ color: accent, backgroundColor: surface }}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const meta = STATUS_META[status];
  return <BaseBadge label={status} accent={meta.accent} surface={meta.surface} />;
}

export function RiskBadge({ bucket }: { bucket: RiskBucket }) {
  const meta = RISK_META[bucket];
  return <BaseBadge label={meta.label} accent={meta.accent} surface={meta.surface} />;
}

export function AnomalyBadge({ type }: { type: string }) {
  const meta = ANOMALY_META[type] ?? ANOMALY_META.none;
  return <BaseBadge label={meta.title} accent={meta.accent} surface={meta.surface} />;
}
