import { PrintOnMount } from '@/components/report/print-on-mount';
import { PrintToolbar } from '@/components/report/print-toolbar';
import { StatusBadge } from '@/components/ui/status-badge';
import { getValidationReportModel } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getDateParam(params: Record<string, string | string[] | undefined>) {
  const raw = params.date;
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function ValidationReportPrintPage({ searchParams }: { searchParams?: SearchParams }) {
  const rawParams = ((await searchParams) ?? {}) as Record<string, string | string[] | undefined>;
  const date = getDateParam(rawParams);
  const model = await getValidationReportModel(date);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <PrintOnMount />
      <PrintToolbar />

      <div className="mx-auto max-w-[1180px] px-6 py-8 print:max-w-none print:px-0 print:py-0">
        <header className="mb-8 border-b border-slate-200 pb-5">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">STOCK.OI</div>
          <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-slate-900">Validation Report</h1>
          <p className="mt-2 text-sm text-slate-600">Final material status snapshot for {model.reportDateLabel}.</p>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-4">
          {model.statusCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{card.label}</div>
              <div className="mt-2 text-[24px] font-semibold text-slate-900">{card.count}</div>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200">
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
                <tr key={`${row.item_code}-${row.batch_id}`}>
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
        </section>
      </div>
    </main>
  );
}
