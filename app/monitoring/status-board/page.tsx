import { AppShell } from '@/components/app/app-shell';
import { DataFilters } from '@/components/ui/data-filters';
import { DonutChart } from '@/components/ui/donut-chart';
import { KpiTile } from '@/components/ui/kpi-tile';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { getStatusBoardModel, normalizeFilters } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readPageParam(params: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(params.page) ? params.page[0] : params.page;
  const parsed = Number(raw ?? '1');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function StatusBoardPage({ searchParams }: { searchParams?: SearchParams }) {
  const rawParams = ((await searchParams) ?? {}) as Record<string, string | string[] | undefined>;
  const filters = normalizeFilters(rawParams);
  const page = readPageParam(rawParams);
  const model = await getStatusBoardModel(filters, page, 10);

  return (
    <AppShell title="Status Board" autoRefreshMs={60000}>
      <DataFilters action="/monitoring/status-board" filters={filters} options={model.filters} showAnomaly={false} showSource={false} />

      <section className="grid gap-4 xl:grid-cols-5">
        {model.statusCards.map((card) => <KpiTile key={card.label} {...card} />)}
        <KpiTile {...model.totalCard} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.25fr] xl:items-start">
        <Panel title="Real-time distribution" description="Operational status distribution." className="self-start">
          <DonutChart segments={model.donutSegments} />

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {model.distributionInsights.map((insight) => (
              <div key={insight.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{insight.label}</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{insight.value}</div>
                <div className="mt-1 text-sm leading-6 text-slate-500">{insight.hint}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Location matrix" description="Inventory status board per location and storage area.">
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Unreleased</th>
                  <th>On Hold</th>
                  <th>Reject</th>
                  <th>Released</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {model.locationMatrix.map((row) => (
                  <tr key={row.location_code}>
                    <td>
                      <div className="font-semibold text-slate-900">{row.location_code}</div>
                      <div className="text-xs text-slate-400">{row.location_name}</div>
                    </td>
                    <td className="font-semibold text-[#2F6EF2]">{row.unreleased}</td>
                    <td className="font-semibold text-[#F2B31B]">{row.onHold}</td>
                    <td className="font-semibold text-[#E55353]">{row.reject}</td>
                    <td className="font-semibold text-[#28B264]">{row.released}</td>
                    <td className="font-semibold text-slate-900">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section className="mt-5">
        <Panel title="Latest material by status" description="Quick access list for operators and supervisors.">
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Batch</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Qty</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {model.recentMaterials.map((row) => (
                  <tr key={row.transaction_id}>
                    <td className="font-semibold text-slate-900">{row.item_name}</td>
                    <td>{row.batch_id}</td>
                    <td>{row.location_slot}</td>
                    <td><StatusBadge status={row.display_status} /></td>
                    <td>{row.quantity_number} {row.unit}</td>
                    <td>{row.timestamp_label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            basePath="/monitoring/status-board"
            currentPage={model.recentMaterialsPagination.currentPage}
            totalPages={model.recentMaterialsPagination.totalPages}
            totalItems={model.recentMaterialsPagination.total}
            pageSize={model.recentMaterialsPagination.pageSize}
            params={filters}
          />
        </Panel>
      </section>
    </AppShell>
  );
}
