import { AppShell } from '@/components/app/app-shell';
import { SmartCaptureWorkspace } from '@/components/smart-capture/smart-capture-workspace';
import { SimpleStat } from '@/components/ui/simple-stat';
import { getSmartCaptureModel } from '@/lib/data';

export default async function SmartCapturePage() {
  const model = await getSmartCaptureModel();

  return (
    <AppShell title="Smart Capture">
      <section className="grid gap-4 md:grid-cols-3">
        <SimpleStat label="Sample documents" value={model.samples.length} description="OCR documents generated." icon="ImageUp" />
        <SimpleStat label="Suggested queue" value={model.suggestedQueueCount} description="Transactions that likely need validation follow-up." icon="AlertTriangle" accent="#F2B31B" surface="#FFF7E7" />
        <SimpleStat label="Extraction accuracy" value={model.extractionAccuracy} description="Confidence level for parsed fields." icon="Search" accent="#28B264" surface="#EBFBF2" />
      </section>

      <section className="mt-5">
        <SmartCaptureWorkspace samples={model.samples} acceptedDocumentTypes={model.acceptedDocumentTypes} acceptedBatchTypes={model.acceptedBatchTypes} />
      </section>
    </AppShell>
  );
}
