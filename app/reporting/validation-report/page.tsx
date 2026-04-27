import Link from 'next/link';
import { AppShell } from '@/components/app/app-shell';
import { Panel } from '@/components/ui/panel';
import { SimpleStat } from '@/components/ui/simple-stat';
import { StatusBadge } from '@/components/ui/status-badge';
import { getValidationReportModel } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function ValidationReportPage({ searchParams }: { searchParams?: SearchParams }) {
  const rawParams = ((await searchParams) ?? {}) as Record<string, string | string[] | undefined>;
  const legacyDate = getParam(rawParams, 'date');
  const from = getParam(rawParams, 'from') ?? legacyDate;
  const to = getParam(rawParams, 'to') ?? legacyDate;
  const model = await getValidationReportModel(from, to);

  return (
    <AppShell title="Validation Report">
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Final material rows" value={model.summary.total} description="Latest material status snapshot for the selected report range." icon="FileText" />
        <SimpleStat label="Released" value={model.summary.released} description="Rows that ended the range in Released status." icon="BadgeCheck" accent="#28B264" surface="#EBFBF2" />
        <SimpleStat label="Anomalies" value={model.summary.anomalies} description="Rows that still carry an active anomaly flag." icon="AlertTriangle" accent="#E55353" surface="#FFF1F1" />
        <SimpleStat label="High risk" value={model.summary.highRisk} description="Rows that should be highlighted in the printed report." icon="AlertTriangle" accent="#F2B31B" surface="#FFF7E7" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
        <Panel title="Report controls" description="Pick a start and end date, then open the printable report and save it as PDF.">
          <form action="/reporting/validation-report" className="grid gap-4 md:grid-cols-[190px_190px_auto_auto] md:items-end">
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">From Date</span>
              <input type="date" name="from" defaultValue={model.reportStartDate} className="input-field h-10" list="validation-report-dates" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">To Date</span>
              <input type="date" name="to" defaultValue={model.reportEndDate} className="input-field h-10" list="validation-report-dates" />
              <datalist id="validation-report-dates">
                {model.availableDates.map((value) => <option key={value} value={value} />)}
              </datalist>
            </label>
            <button type="submit" className="primary-button h-10 px-4 text-sm">Apply Date Range</button>
            <Link href={model.printHref} target="_blank" className="secondary-button h-10 px-4 text-sm">
              Print / Save PDF
            </Link>
          </form>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
            The report only includes final material status rows from <span className="font-semibold text-slate-800">{model.reportStartDateLabel}</span> to <span className="font-semibold text-slate-800">{model.reportEndDateLabel}</span>, ordered from newest to oldest. Choose <span className="font-semibold text-slate-800">Save as PDF</span> in the browser print dialog to export it.
          </div>
        </Panel>

        <Panel title="Status summary" description={`Final material status snapshot for ${model.reportDateLabel}.`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {model.statusCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 px-4 py-3" style={{ backgroundColor: card.surface }}>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{card.label}</div>
                <div className="mt-2 text-[24px] font-semibold text-slate-900">{card.count}</div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-5">
        <Panel title="Final material status list" description="Printable status list by material, batch, and storage location. Newest updates appear first.">
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Batch</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Qty</th>
                  <th>Source</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {model.rows.map((row) => (
                  <tr key={`${row.item_code}-${row.batch_id}-${row.timestamp}`}>
                    <td>
                      <div className="font-semibold text-slate-900">{row.item_name}</div>
                      <div className="text-xs text-slate-400">{row.item_code}</div>
                    </td>
                    <td>{row.batch_id}</td>
                    <td>{row.location_slot}</td>
                    <td><StatusBadge status={row.display_status} /></td>
                    <td>{row.quantity_number} {row.unit}</td>
                    <td>{row.source_label}</td>
                    <td>{row.timestamp_label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {model.rows.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500">No material status rows found for this date range.</div>
            ) : null}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
