import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app/app-shell';
import { Panel } from '@/components/ui/panel';
import { SimpleStat } from '@/components/ui/simple-stat';
import { AnomalyBadge, RiskBadge, StatusBadge } from '@/components/ui/status-badge';
import { ReviewDecisionPanel } from '@/components/review/review-decision-panel';
import { TimelineList } from '@/components/ui/timeline';
import { getReviewModel } from '@/lib/data';

type Params = Promise<{ transactionId: string }>;

export default async function ReviewDetailPage({ params }: { params: Params }) {
  const resolved = await params;
  const model = await getReviewModel(resolved.transactionId);

  if (!model) {
    notFound();
  }

  const { transaction } = model;

  return (
    <AppShell title="Review Detail" searchAction={`/review/${transaction.transaction_id}`}>
      <section className="grid gap-4 md:grid-cols-4">
        <SimpleStat label="Risk score" value={model.metrics.risk} description="AI risk assessment for this transaction." icon="AlertTriangle" accent="#E55353" surface="#FFF1F1" />
        <SimpleStat label="Completeness" value={model.metrics.completeness} description="Captured field completeness percentage." icon="ShieldCheck" accent="#28B264" surface="#EBFBF2" />
        <SimpleStat label="Related logs" value={model.metrics.auditCount} description="Audit entries linked to the same item and batch." icon="History" accent="#2F6EF2" surface="#EEF4FF" />
        <SimpleStat label="Sibling records" value={model.metrics.reviewCount} description="Transactions found for the same item and batch." icon="Search" accent="#F2B31B" surface="#FFF7E7" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Validation result" description="Inspect AI output, traceability data, and operational context before making a supervisor decision.">
          <div className="grid gap-4 md:grid-cols-2">
            <DetailField label="Transaction ID" value={transaction.transaction_id} />
            <DetailField label="Validation ID" value={transaction.validation_id} />
            <DetailField label="Material" value={`${transaction.item_name} (${transaction.item_code})`} />
            <DetailField label="Batch" value={transaction.batch_id} />
            <DetailField label="Location" value={`${transaction.location_slot} • ${transaction.location}`} />
            <DetailField label="Source" value={transaction.source_label} />
            <DetailField label="Recommended Status" value={transaction.recommended_display_status} />
            <DetailField label="Current Status" value={transaction.display_status} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusBadge status={transaction.display_status} />
            <StatusBadge status={transaction.recommended_display_status} />
            <RiskBadge bucket={transaction.risk_bucket} />
            <AnomalyBadge type={transaction.anomaly_type} />
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">AI Explanation</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{transaction.ai_explanation}</p>
          </div>
        </Panel>

        <Panel title="Supervisor decision" description="Confirm or override the recommendation and save the local review note.">
          <ReviewDecisionPanel recommendedStatus={transaction.recommended_display_status} />
        </Panel>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Audit log timeline" description="Traceable status changes for the same item and batch.">
          <TimelineList items={model.relatedAudit} />
        </Panel>

        <Panel title="Related transactions" description="Sibling records found for the same material and batch.">
          <div className="table-shell">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Status</th>
                  <th>Recommended</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {model.siblingTransactions.map((row) => (
                  <tr key={row.transaction_id}>
                    <td>
                      <div className="font-semibold text-slate-900">{row.transaction_id}</div>
                      <div className="text-xs text-slate-400">{row.timestamp_label}</div>
                    </td>
                    <td><StatusBadge status={row.display_status} /></td>
                    <td><StatusBadge status={row.recommended_display_status} /></td>
                    <td><RiskBadge bucket={row.risk_bucket} /></td>
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

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
