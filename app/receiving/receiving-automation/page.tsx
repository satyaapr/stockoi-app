import { AppShell } from '@/components/app/app-shell';
import { ReceivingAutomationWorkspace } from '@/components/receiving-automation/receiving-automation-workspace';
import { SimpleStat } from '@/components/ui/simple-stat';
import { getReceivingAutomationModel } from '@/lib/data';

export default async function ReceivingAutomationPage() {
  const model = await getReceivingAutomationModel();

  return (
    <AppShell title="Receiving Automation">
      <section className="grid gap-4 md:grid-cols-3">
        <SimpleStat label="Sample documents" value={model.samples.length} description="Demo OCR documents generated from the uploaded dataset." icon="ImageUp" />
        <SimpleStat label="Suggested queue" value={model.suggestedQueueCount} description="Transactions that likely need validation follow-up." icon="AlertTriangle" accent="#F2B31B" surface="#FFF7E7" />
        <SimpleStat label="Extraction accuracy" value={model.extractionAccuracy} description="Demo confidence level for parsed fields." icon="Search" accent="#28B264" surface="#EBFBF2" />
      </section>

      <section className="mt-5">
        <ReceivingAutomationWorkspace samples={model.samples} acceptedDocumentTypes={model.acceptedDocumentTypes} acceptedBatchTypes={model.acceptedBatchTypes} />
      </section>
    </AppShell>
  );
}
