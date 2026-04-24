import { AppShell } from '@/components/app/app-shell';
import { DataFilters } from '@/components/ui/data-filters';
import { Panel } from '@/components/ui/panel';
import { getUserManagementModel, normalizeFilters } from '@/lib/data';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function UserManagementPage({ searchParams }: { searchParams?: SearchParams }) {
  const filters = normalizeFilters(((await searchParams) ?? {}) as Record<string, string | string[] | undefined>);
  const model = await getUserManagementModel(filters);

  return (
    <AppShell title="User Management" searchAction="/master/user-management" searchValue={filters.query}>
      <DataFilters action="/master/user-management" filters={filters} options={{}} showStatus={false} showLocation={false} showRisk={false} showAnomaly={false} showSource={false} searchPlaceholder="Search user, role, or assigned location..." />
      <section>
        <Panel title="Operational users" description="Demo user list connected to inventory updates and approvals.">
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Assigned Location</th>
                  <th>Handled Txn</th>
                  <th>Approvals</th>
                </tr>
              </thead>
              <tbody>
                {model.users.map((user) => (
                  <tr key={user.user_id}>
                    <td className="font-semibold text-slate-900">{user.name}</td>
                    <td>{user.display_role}</td>
                    <td>
                      <div>{user.assigned_location_code}</div>
                      <div className="text-xs text-slate-400">{user.assigned_location}</div>
                    </td>
                    <td>{user.handled_transactions}</td>
                    <td>{user.approval_count}</td>
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
