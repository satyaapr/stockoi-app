import { AppShell } from '@/components/app/app-shell';
import { DataFilters } from '@/components/ui/data-filters';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Panel } from '@/components/ui/panel';
import { SimpleStat } from '@/components/ui/simple-stat';
import { AnomalyBadge, StatusBadge } from '@/components/ui/status-badge';
import { getAuditTrailModel, normalizeFilters } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readNamedPageParam(params: Record<string, string | string[] | undefined>, key: string) {
  const rawValue = params[key];
  const raw = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  const parsed = Number(raw ?? '1');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function paginationParams(filters: ReturnType<typeof normalizeFilters>, pageKey: string, pageValue: number) {
  return {
    ...filters,
    [pageKey]: pageValue > 1 ? pageValue : undefined,
  } as Record<string, string | number | undefined>;
}

export default async function AuditTrailPage({ searchParams }: { searchParams?: SearchParams }) {
  const rawParams = ((await searchParams) ?? {}) as Record<string, string | string[] | undefined>;
  const filters = normalizeFilters(rawParams);
  const timelinePage = readNamedPageParam(rawParams, 'timelinePage');
  const exceptionPage = readNamedPageParam(rawParams, 'exceptionPage');
  const agingPage = readNamedPageParam(rawParams, 'agingPage');
  const model = await getAuditTrailModel(filters, timelinePage, exceptionPage, agingPage);

  return (
    <AppShell title="Audit Trail">
      <DataFilters
        action="/tracking/audit-trail"
        filters={filters}
        options={model.filters}
        showRisk={false}
        showAnomaly={false}
        showSource={false}
        showDateRange
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SimpleStat label="Audit logs" value={model.metrics.totalLogs} description="All status changes tracked in the current filter view." icon="History" />
        <SimpleStat label="Approvals" value={model.metrics.approvals} description="Logs with an approver recorded in the audit trail." icon="ShieldCheck" accent="#28B264" surface="#EBFBF2" />
        <SimpleStat label="Exception rows" value={model.metrics.exceptions} description="Anomalous transactions listed in the current report." icon="AlertTriangle" accent="#E55353" surface="#FFF1F1" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.18fr_0.82fr] xl:items-start">
        <Panel title="Audit log timeline" description="Traceable history of status changes, reasons, and approvers.">
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Item</th>
                  <th>Change</th>
                  <th>Changed By</th>
                  <th>Approved By</th>
                </tr>
              </thead>
              <tbody>
                {model.timeline.map((log) => (
                  <tr key={log.log_id}>
                    <td>
                      <div className="font-semibold text-slate-900">{log.date_label}</div>
                      <div className="text-xs text-slate-400">{log.time_label}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">{log.item_name}</div>
                      <div className="text-xs text-slate-400">{log.batch_id}</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={log.previous_display_status} />
                        <span className="text-slate-400">→</span>
                        <StatusBadge status={log.new_display_status} />
                      </div>
                      <div className="mt-2 text-sm text-slate-500">{log.reason}</div>
                    </td>
                    <td>{log.changed_by}</td>
                    <td>{log.approved_by || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            basePath="/tracking/audit-trail"
            currentPage={model.timelinePagination.currentPage}
            totalPages={model.timelinePagination.totalPages}
            totalItems={model.timelinePagination.total}
            pageSize={model.timelinePagination.pageSize}
            params={paginationParams(filters, 'timelinePage', model.timelinePagination.currentPage)}
            pageParam="timelinePage"
          />
        </Panel>

        <div className="space-y-5">
          <Panel title="Exception report" description="Current anomalies requiring follow-up and supervisor attention.">
            <div className="space-y-3">
              {model.exceptionReport.map((row) => (
                <div key={row.transaction_id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{row.item_name}</div>
                      <div className="text-xs text-slate-400">{row.transaction_id} • {row.location_slot}</div>
                    </div>
                    <AnomalyBadge type={row.anomaly_type} />
                  </div>
                </div>
              ))}
            </div>

            <PaginationControls
              basePath="/tracking/audit-trail"
              currentPage={model.exceptionPagination.currentPage}
              totalPages={model.exceptionPagination.totalPages}
              totalItems={model.exceptionPagination.total}
              pageSize={model.exceptionPagination.pageSize}
              params={paginationParams(filters, 'exceptionPage', model.exceptionPagination.currentPage)}
              pageParam="exceptionPage"
            />
          </Panel>

          <Panel title="Aging hold cases" description="Items that exceeded the hold threshold and should be resolved first.">
            <div className="space-y-3">
              {model.agingCases.map((row) => (
                <div key={row.transaction_id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="font-semibold text-slate-900">{row.item_name}</div>
                  <div className="mt-1 text-sm text-slate-500">{row.batch_id} • {row.location_slot}</div>
                </div>
              ))}
            </div>

            <PaginationControls
              basePath="/tracking/audit-trail"
              currentPage={model.agingPagination.currentPage}
              totalPages={model.agingPagination.totalPages}
              totalItems={model.agingPagination.total}
              pageSize={model.agingPagination.pageSize}
              params={paginationParams(filters, 'agingPage', model.agingPagination.currentPage)}
              pageParam="agingPage"
            />
          </Panel>
        </div>
      </section>
    </AppShell>
  );
}
