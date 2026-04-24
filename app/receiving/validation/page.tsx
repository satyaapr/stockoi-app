import Link from 'next/link';
import { AppShell } from '@/components/app/app-shell';
import { DataFilters } from '@/components/ui/data-filters';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Panel } from '@/components/ui/panel';
import { SimpleStat } from '@/components/ui/simple-stat';
import { AnomalyBadge, RiskBadge, StatusBadge } from '@/components/ui/status-badge';
import { getValidationModel, normalizeFilters } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readPageParam(params: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(params.page) ? params.page[0] : params.page;
  const parsed = Number(raw ?? '1');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function ValidationPage({ searchParams }: { searchParams?: SearchParams }) {
  const rawParams = ((await searchParams) ?? {}) as Record<string, string | string[] | undefined>;
  const filters = normalizeFilters(rawParams);
  const page = readPageParam(rawParams);
  const model = await getValidationModel(filters, page, 5);

  return (
    <AppShell title="Validation">
      <DataFilters action="/receiving/validation" filters={filters} options={model.filters} />

      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Total records" value={model.metrics.total} description="Transactions visible in the current validation scope." icon="ShieldCheck" />
        <SimpleStat label="Flagged records" value={model.metrics.flagged} description="Anomalies that require review." icon="AlertTriangle" accent="#E55353" surface="#FFF1F1" />
        <SimpleStat label="High risk" value={model.metrics.highRisk} description="Transactions with the highest urgency." icon="AlertTriangle" accent="#F2B31B" surface="#FFF7E7" />
        <SimpleStat label="Suggested status changes" value={model.metrics.statusChange} description="Rows where AI recommends a different status." icon="Search" accent="#28B264" surface="#EBFBF2" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <Panel title="Validation queue" description="Operator and supervisor view of AI-assisted checks and recommendations.">
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Status</th>
                  <th>Recommended</th>
                  <th>Risk</th>
                  <th>Source</th>
                  <th>Anomaly</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {model.queue.map((row) => (
                  <tr key={row.transaction_id}>
                    <td>
                      <div className="font-semibold text-slate-900">{row.item_name}</div>
                      <div className="text-xs text-slate-400">{row.transaction_id} • {row.batch_id}</div>
                      <div className="mt-2 max-w-[360px] text-sm leading-6 text-slate-500">{row.ai_explanation}</div>
                    </td>
                    <td><StatusBadge status={row.display_status} /></td>
                    <td><StatusBadge status={row.recommended_display_status} /></td>
                    <td><RiskBadge bucket={row.risk_bucket} /></td>
                    <td>
                      <div className="font-medium text-slate-700">{row.source_label}</div>
                      <div className="text-xs text-slate-400">{row.location_slot}</div>
                    </td>
                    <td><AnomalyBadge type={row.anomaly_type} /></td>
                    <td>
                      <Link href={`/review/${row.transaction_id}`} className="text-sm font-semibold text-[#2F6EF2] hover:underline">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            basePath="/receiving/validation"
            currentPage={model.pagination.currentPage}
            totalPages={model.pagination.totalPages}
            totalItems={model.pagination.total}
            pageSize={model.pagination.pageSize}
            params={filters}
          />
        </Panel>

        <div className="space-y-5">
          <Panel title="Validation checklist" description="Use the review page to confirm the recommended status, reason, and related movement timeline for each flagged transaction.">
            <ul className="space-y-3 text-sm leading-6 text-slate-600">
              <li>Check item, batch, quantity, storage slot, and source label.</li>
              <li>Compare the current status with the recommended_status output.</li>
              <li>Review risk_score and anomaly_type before changing the material status.</li>
              <li>Read ai_explanation and move to Review for supervisor action.</li>
            </ul>
          </Panel>

          <Panel title="Latest review-ready records" description="Recent transactions sorted by risk score.">
            <div className="space-y-3">
              {model.latest.map((row) => (
                <div key={row.transaction_id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{row.item_name}</div>
                      <div className="text-xs text-slate-400">{row.transaction_id} • {row.source_label}</div>
                    </div>
                    <RiskBadge bucket={row.risk_bucket} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}
