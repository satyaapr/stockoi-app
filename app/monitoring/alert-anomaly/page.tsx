import Link from 'next/link';
import { AppShell } from '@/components/app/app-shell';
import { DataFilters } from '@/components/ui/data-filters';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { AppIcon } from '@/components/ui/icon';
import { Panel } from '@/components/ui/panel';
import { SimpleStat } from '@/components/ui/simple-stat';
import { RiskBadge, StatusBadge } from '@/components/ui/status-badge';
import { getAlertAnomalyModel, normalizeFilters } from '@/lib/data';
import { ANOMALY_META } from '@/lib/theme';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readPageParam(params: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(params.page) ? params.page[0] : params.page;
  const parsed = Number(raw ?? '1');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AlertAnomalyPage({ searchParams }: { searchParams?: SearchParams }) {
  const rawParams = ((await searchParams) ?? {}) as Record<string, string | string[] | undefined>;
  const filters = normalizeFilters(rawParams);
  const page = readPageParam(rawParams);
  const model = await getAlertAnomalyModel(filters, page, 5);

  return (
    <AppShell title="Alert & Anomaly">
      <DataFilters action="/monitoring/alert-anomaly" filters={filters} options={model.filters} showAnomaly showSource showLocation showRisk />

      <section className="grid gap-4 md:grid-cols-3">
        <SimpleStat label="Total alerts" value={model.summary.total} description="Flagged transactions shown in the active filter set." icon="AlertTriangle" accent="#E55353" surface="#FFF1F1" />
        <SimpleStat label="High severity" value={model.summary.high} description="Immediate supervisor attention recommended." icon="AlertTriangle" accent="#F2B31B" surface="#FFF7E7" />
        <SimpleStat label="Medium severity" value={model.summary.medium} description="Needs validation follow-up or data completion." icon="Clock3" accent="#2F6EF2" surface="#EEF4FF" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Anomaly feed" description="Real-time list of suspicious or incomplete transactions.">
          <div className="space-y-4">
            {model.alerts.map((row) => {
              const meta = ANOMALY_META[row.anomaly_type] ?? ANOMALY_META.none;
              return (
                <div key={row.transaction_id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-full" style={{ backgroundColor: meta.surface, color: meta.accent }}>
                      <AppIcon name={meta.icon} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold text-slate-900">{row.anomaly_title}</div>
                        <RiskBadge bucket={row.risk_bucket} />
                        <StatusBadge status={row.display_status} />
                      </div>
                      <div className="mt-2 text-sm leading-6 text-slate-600">{row.anomaly_description}</div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>{row.item_name}</span>
                        <span>{row.batch_id}</span>
                        <span>{row.location_slot}</span>
                        <span>{row.created_time_label}</span>
                      </div>
                    </div>
                    <Link href={`/review/${row.transaction_id}`} className="shrink-0 pt-1 text-sm font-semibold text-[#2F6EF2] hover:underline">Review</Link>
                  </div>
                </div>
              );
            })}
          </div>

          <PaginationControls
            basePath="/monitoring/alert-anomaly"
            currentPage={model.pagination.currentPage}
            totalPages={model.pagination.totalPages}
            totalItems={model.pagination.total}
            pageSize={model.pagination.pageSize}
            params={filters}
          />
        </Panel>

        <div className="space-y-5">
          <Panel title="Grouped anomaly breakdown" description="Top anomaly types detected in the current filter scope.">
            <div className="space-y-3">
              {model.grouped.map((group) => (
                <div key={group.type} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-900">{group.title}</div>
                    <div className="text-sm text-slate-500">{group.type}</div>
                  </div>
                  <div className="text-[22px] font-semibold text-slate-900">{group.count}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Hotspot locations" description="Areas with the highest number of active anomalies.">
            <div className="table-shell">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Total</th>
                    <th>On Hold</th>
                    <th>Reject</th>
                  </tr>
                </thead>
                <tbody>
                  {model.locations.map((row) => (
                    <tr key={row.location_code}>
                      <td>
                        <div className="font-semibold text-slate-900">{row.location_code}</div>
                        <div className="text-xs text-slate-400">{row.location_name}</div>
                      </td>
                      <td>{row.total}</td>
                      <td>{row.onHold}</td>
                      <td>{row.reject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}
