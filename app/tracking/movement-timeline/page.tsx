import { AppShell } from '@/components/app/app-shell';
import { DataFilters } from '@/components/ui/data-filters';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { Panel } from '@/components/ui/panel';
import { SimpleStat } from '@/components/ui/simple-stat';
import { TimelineList } from '@/components/ui/timeline';
import { StatusBadge } from '@/components/ui/status-badge';
import { getMovementTimelineModel, normalizeFilters } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readPageParam(params: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(params.page) ? params.page[0] : params.page;
  const parsed = Number(raw ?? '1');
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function MovementTimelinePage({ searchParams }: { searchParams?: SearchParams }) {
  const rawParams = ((await searchParams) ?? {}) as Record<string, string | string[] | undefined>;
  const filters = normalizeFilters(rawParams);
  const page = readPageParam(rawParams);
  const model = await getMovementTimelineModel(filters, page, 7);

  return (
    <AppShell title="Movement Timeline">
      <DataFilters
        action="/tracking/movement-timeline"
        filters={filters}
        options={model.filters}
        showRisk={false}
        showAnomaly={false}
        showSource={false}
        showDateRange
      />

      <section className="grid gap-4 md:grid-cols-3">
        <SimpleStat label="Timeline events" value={model.summary.total} description="Audit movements visible in the active filter scope." icon="GitBranch" />
        <SimpleStat label="Moved to hold" value={model.summary.movedToHold} description="Materials shifted into On Hold." icon="Lock" accent="#F2B31B" surface="#FFF7E7" />
        <SimpleStat label="Moved to release" value={model.summary.movedToRelease} description="Materials released back to operations." icon="BadgeCheck" accent="#28B264" surface="#EBFBF2" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
        <Panel title="Movement timeline" description="Chronological status changes for material lots and batches.">
          <TimelineList items={model.timeline} />
          <PaginationControls
            basePath="/tracking/movement-timeline"
            currentPage={model.pagination.currentPage}
            totalPages={model.pagination.totalPages}
            totalItems={model.pagination.total}
            pageSize={model.pagination.pageSize}
            params={filters}
          />
        </Panel>

        <Panel title="Related transactions" description="Recent transactions aligned with the filtered timeline view." className="self-start">
          <div className="space-y-3">
            {model.recentTransactions.map((row) => (
              <div key={row.transaction_id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{row.item_name}</div>
                    <div className="text-xs text-slate-400">{row.transaction_id} • {row.location_slot}</div>
                  </div>
                  <StatusBadge status={row.display_status} />
                </div>
                <div className="mt-2 text-sm text-slate-500">{row.timestamp_label}</div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
