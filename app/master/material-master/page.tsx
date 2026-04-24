import { AppShell } from '@/components/app/app-shell';
import { DataFilters } from '@/components/ui/data-filters';
import { Panel } from '@/components/ui/panel';
import { SimpleStat } from '@/components/ui/simple-stat';
import { getMaterialMasterModel, normalizeFilters } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MaterialMasterPage({ searchParams }: { searchParams?: SearchParams }) {
  const filters = normalizeFilters(((await searchParams) ?? {}) as Record<string, string | string[] | undefined>);
  const model = await getMaterialMasterModel(filters);

  return (
    <AppShell title="Material Master" searchAction="/master/material-master" searchValue={filters.query}>
      <DataFilters action="/master/material-master" filters={filters} options={{}} showStatus={false} showLocation={false} showRisk={false} showAnomaly={false} showSource={false} searchPlaceholder="Search item code, name, category, or supplier..." />

      <section className="grid gap-4 md:grid-cols-3">
        <SimpleStat label="Total materials" value={model.metrics.total} description="Materials available in master data." icon="Boxes" />
        <SimpleStat label="Active in transactions" value={model.metrics.active} description="Materials currently referenced by the demo dataset." icon="Search" accent="#28B264" surface="#EBFBF2" />
        <SimpleStat label="With anomalies" value={model.metrics.withAnomalies} description="Materials appearing in anomalous transactions." icon="AlertTriangle" accent="#E55353" surface="#FFF1F1" />
      </section>

      <section className="mt-5">
        <Panel title="Material registry" description="Master item list used by receiving, validation, and reporting screens.">
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Material</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Standard Location</th>
                  <th>Allowed Status</th>
                  <th>Active Txn</th>
                </tr>
              </thead>
              <tbody>
                {model.materials.map((item) => (
                  <tr key={item.item_code}>
                    <td className="font-semibold text-slate-900">{item.item_code}</td>
                    <td>{item.item_name}</td>
                    <td>{item.category}</td>
                    <td>{item.supplier_name}</td>
                    <td>{item.standard_location_code}</td>
                    <td className="max-w-[320px] text-sm leading-6 text-slate-600">{item.allowed_status}</td>
                    <td>{item.active_transactions}</td>
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
