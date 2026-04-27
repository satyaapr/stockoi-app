import Link from 'next/link';
import { AppShell } from '@/components/app/app-shell';
import { DonutChart } from '@/components/ui/donut-chart';
import { KpiTile } from '@/components/ui/kpi-tile';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { TimelineList } from '@/components/ui/timeline';
import { AppIcon } from '@/components/ui/icon';
import { getDashboardModel, normalizeFilters } from '@/lib/data';
import { ANOMALY_META } from '@/lib/theme';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DashboardPage({ searchParams }: { searchParams?: SearchParams }) {
  const filters = normalizeFilters(((await searchParams) ?? {}) as Record<string, string | string[] | undefined>);
  const model = await getDashboardModel(filters);

  return (
    <AppShell title="Dashboard" searchAction="/" searchValue={filters.query} showSearch autoRefreshMs={60000}>
      <section className="grid gap-4 xl:grid-cols-5">
        {model.statusCards.map((card) => (
          <KpiTile key={card.label} {...card} />
        ))}
        <KpiTile {...model.totalCard} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.06fr_1.55fr_1.05fr]">
        <Panel
          title="Receiving Activity"
          description="Dashboard only shows the latest structured intake records captured through Smart Capture or batch upload."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {model.receivingSourceMix.slice(0, 3).map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{item.label}</div>
                <div className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900">{item.count}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Material</th>
                  <th>Slot</th>
                  <th>Status</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {model.receivingActivity.map((row) => (
                  <tr key={row.transaction_id}>
                    <td>
                      <div className="font-semibold text-slate-900">{row.transaction_id}</div>
                      <div className="text-xs text-slate-400">{row.created_date_label} • {row.created_time_label}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">{row.item_name}</div>
                      <div className="text-xs text-slate-400">{row.batch_id}</div>
                    </td>
                    <td>
                      <div>{row.location_slot}</div>
                      <div className="text-xs text-slate-400">{row.location_code}</div>
                    </td>
                    <td><StatusBadge status={row.display_status} /></td>
                    <td>{row.source_label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          title="Status Board (Real-Time)"
          description="Live inventory distribution across the active operation area."
          action={
            <Link href="/monitoring/status-board" className="secondary-button h-10 px-4 text-sm whitespace-nowrap">
              All Location
            </Link>
          }
        >
          <DonutChart segments={model.donutSegments} />
          <div className="mt-6 table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>By Location</th>
                  <th>Unreleased</th>
                  <th>On Hold</th>
                  <th>Reject</th>
                  <th>Released</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {model.locationMatrix.slice(0, 5).map((row) => (
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
                <tr>
                  <td className="font-semibold text-slate-900">Total</td>
                  <td className="font-semibold text-[#2F6EF2]">{model.statusCards[0].count}</td>
                  <td className="font-semibold text-[#F2B31B]">{model.statusCards[1].count}</td>
                  <td className="font-semibold text-[#E55353]">{model.statusCards[2].count}</td>
                  <td className="font-semibold text-[#28B264]">{model.statusCards[3].count}</td>
                  <td className="font-semibold text-slate-900">{model.totalCard.count}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          title="Alert & Anomaly"
          description="Priority exceptions that require operator or supervisor action."
          action={
            <Link href="/monitoring/alert-anomaly" className="text-sm font-medium text-[#2F6EF2] whitespace-nowrap hover:underline">
              View all
            </Link>
          }
        >
          <div className="space-y-4">
            {model.anomalyFeed.map((row) => {
              const meta = ANOMALY_META[row.anomaly_type] ?? ANOMALY_META.none;
              return (
                <div key={row.transaction_id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-full" style={{ backgroundColor: meta.surface, color: meta.accent }}>
                      <AppIcon name={meta.icon} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-lg font-semibold leading-tight text-slate-900">{row.anomaly_title}</div>
                        <div className="shrink-0 text-sm text-slate-500">{row.created_time_label}</div>
                      </div>
                      <div className="mt-2 text-sm leading-6 text-slate-600">{row.anomaly_description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_1.35fr]">
        <Panel
          title="Movement Timeline"
          description="Traceable status movement for the latest material actions."
          action={
            <Link href="/tracking/movement-timeline" className="text-sm font-medium text-[#2F6EF2] whitespace-nowrap hover:underline">
              View Full Timeline
            </Link>
          }
        >
          <TimelineList items={model.timeline} />
        </Panel>

        <Panel
          title="Recent Material (Top 5)"
          description="Latest validated material activity pulled from the CSV dataset."
          action={
            <Link href="/receiving/validation" className="text-sm font-medium text-[#2F6EF2] whitespace-nowrap hover:underline">
              View all
            </Link>
          }
        >
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Batch</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Qty</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {model.recentMaterials.map((row) => (
                  <tr key={row.transaction_id}>
                    <td>
                      <div className="font-semibold text-slate-900">{row.item_name}</div>
                      <div className="text-xs text-slate-400">{row.item_code}</div>
                    </td>
                    <td>{row.batch_id}</td>
                    <td>{row.location_slot}</td>
                    <td><StatusBadge status={row.display_status} /></td>
                    <td>
                      <div className="font-semibold text-slate-900">{row.quantity_number}</div>
                      <div className="text-xs text-slate-400">{row.unit}</div>
                    </td>
                    <td>
                      <div>{row.created_date_label}</div>
                      <div className="text-xs text-slate-400">{row.created_time_label}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
