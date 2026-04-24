import { AppShell } from '@/components/app/app-shell';
import { DataFilters } from '@/components/ui/data-filters';
import { Panel } from '@/components/ui/panel';
import { getLocationMasterModel, normalizeFilters } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LocationMasterPage({ searchParams }: { searchParams?: SearchParams }) {
  const filters = normalizeFilters(((await searchParams) ?? {}) as Record<string, string | string[] | undefined>);
  const model = await getLocationMasterModel(filters);

  return (
    <AppShell title="Location Master" searchAction="/master/location-master" searchValue={filters.query}>
      <DataFilters action="/master/location-master" filters={filters} options={{}} showStatus={false} showLocation={false} showRisk={false} showAnomaly={false} showSource={false} searchPlaceholder="Search location name, code, or category rule..." />
      <section>
        <Panel title="Location registry" description="Operational locations and allowed categories for storage and movement.">
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Allowed Categories</th>
                  <th>Restricted Status</th>
                  <th>Active Txn</th>
                  <th>Anomalies</th>
                </tr>
              </thead>
              <tbody>
                {model.locations.map((location) => (
                  <tr key={location.location_id}>
                    <td>
                      <div className="font-semibold text-slate-900">{location.location_code}</div>
                      <div className="text-xs text-slate-400">{location.location_name}</div>
                    </td>
                    <td>{location.location_type}</td>
                    <td className="max-w-[320px] text-sm leading-6 text-slate-600">{location.allowed_categories}</td>
                    <td>{location.restricted_status || '-'}</td>
                    <td>{location.active_transactions}</td>
                    <td>{location.anomaly_count}</td>
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
