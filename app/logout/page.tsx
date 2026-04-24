import Link from 'next/link';
import { AppShell } from '@/components/app/app-shell';
import { Panel } from '@/components/ui/panel';

export default function LogoutPage() {
  return (
    <AppShell title="Logout">
      <Panel title="Demo logout" description="This prototype does not persist authentication, so logout returns the operator to the main dashboard.">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-6 text-slate-600">
          You are using the STOCK.OI hackathon demo workspace. In production this page would clear the active session and redirect the operator to the login page.
        </div>
        <div className="mt-5 flex gap-3">
          <Link href="/" className="primary-button h-10 px-5 text-sm">Return to Dashboard</Link>
          <Link href="/reporting/validation-report" className="secondary-button h-10 px-5 text-sm">Open Validation Report</Link>
        </div>
      </Panel>
    </AppShell>
  );
}
