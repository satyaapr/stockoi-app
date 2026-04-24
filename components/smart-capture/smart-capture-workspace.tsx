'use client';

import type { ChangeEvent } from 'react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CaptureSample, ReceivingEntry } from '@/lib/types';
import { AppIcon } from '@/components/ui/icon';
import { StatusBadge } from '@/components/ui/status-badge';

type SmartCaptureWorkspaceProps = {
  samples: CaptureSample[];
  acceptedDocumentTypes: string[];
  acceptedBatchTypes: string[];
};

type UploadMode = 'document' | 'batch';

type BatchSummary = {
  fileName: string;
  extension: string;
  estimatedRows: number | null;
};

function emptyEntry(): ReceivingEntry {
  return {
    documentNo: '',
    receivingDate: '',
    supplier: '',
    material: '',
    materialCode: '',
    batchNo: '',
    quantity: '',
    unit: '',
    location: '',
    locationSlot: '',
    initialStatus: 'Unreleased',
  };
}

function parseRawText(rawText: string, fallback: ReceivingEntry): ReceivingEntry {
  const valueFor = (label: string) => {
    const match = rawText.match(new RegExp(`${label}:\\s*(.+)`, 'i'));
    return match?.[1]?.trim() ?? '';
  };

  const materialMatch = valueFor('Material');
  const materialCodeMatch = materialMatch.match(/\(([^)]+)\)/)?.[1] ?? fallback.materialCode;
  const materialName = materialMatch.replace(/\s*\([^)]*\)/, '').trim() || fallback.material;
  const quantityMatch = valueFor('Qty').match(/([\d,.]+)\s*(\w+)?/);

  return {
    documentNo: valueFor('Receiving Document') || fallback.documentNo,
    receivingDate: fallback.receivingDate,
    supplier: valueFor('Supplier') || fallback.supplier,
    material: materialName,
    materialCode: materialCodeMatch,
    batchNo: valueFor('Batch') || fallback.batchNo,
    quantity: quantityMatch?.[1] ?? fallback.quantity,
    unit: quantityMatch?.[2] ?? fallback.unit,
    location: fallback.location,
    locationSlot: valueFor('Location') || fallback.locationSlot,
    initialStatus: (valueFor('Initial Status') as ReceivingEntry['initialStatus']) || fallback.initialStatus,
  };
}

function countCsvRows(csvText: string) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) return 0;
  return lines.length - 1;
}

function fileExtension(fileName: string) {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() ?? '' : '';
}

export function SmartCaptureWorkspace({ samples, acceptedDocumentTypes, acceptedBatchTypes }: SmartCaptureWorkspaceProps) {
  const [selectedId, setSelectedId] = useState(samples[0]?.id ?? '');
  const [rawText, setRawText] = useState(samples[0]?.rawText ?? '');
  const [result, setResult] = useState<ReceivingEntry>(samples[0]?.extracted ?? emptyEntry());
  const [message, setMessage] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>('document');
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);

  const selectedSample = useMemo(() => samples.find((sample) => sample.id === selectedId) ?? samples[0], [samples, selectedId]);

  function handleSampleChange(sampleId: string) {
    const sample = samples.find((item) => item.id === sampleId);
    if (!sample) return;
    setSelectedId(sampleId);
    setRawText(sample.rawText);
    setResult(sample.extracted);
    setUploadMode('document');
    setBatchSummary(null);
    setMessage(null);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = fileExtension(file.name);
    const isDocument = ['pdf', 'jpg', 'jpeg', 'png'].includes(extension);
    const isBatch = ['csv', 'xls', 'xlsx'].includes(extension);

    if (!isDocument && !isBatch) {
      setMessage('Unsupported file type. Upload PDF/JPG/PNG for single document OCR, or CSV/XLS/XLSX for batch upload.');
      return;
    }

    if (isBatch) {
      setUploadMode('batch');
      let estimatedRows: number | null = null;
      if (extension === 'csv') {
        const csvText = await file.text();
        estimatedRows = countCsvRows(csvText);
        setRawText([
          `Batch Upload File: ${file.name}`,
          `Detected Mode: Batch Upload`,
          `Estimated Data Rows: ${estimatedRows}`,
          'Accepted route: Validation Queue',
          'Preview note: CSV content is summarized in this demo workspace.',
        ].join('\n'));
      } else {
        setRawText([
          `Batch Upload File: ${file.name}`,
          `Detected Mode: Batch Upload`,
          'Preview note: Excel files are accepted in the demo, but inline parsing is limited in this prototype.',
          'Accepted route: Validation Queue',
        ].join('\n'));
      }
      setBatchSummary({
        fileName: file.name,
        extension,
        estimatedRows,
      });
      setResult({ ...emptyEntry(), initialStatus: 'Unreleased' });
      setMessage(`Batch upload detected. ${file.name} will be treated as a bulk intake file and sent directly to validation.`);
      return;
    }

    setUploadMode('document');
    setBatchSummary(null);
    setRawText([
      `Uploaded Document: ${file.name}`,
      'Detected Mode: Single Document OCR',
      'This demo accepts PDF, JPG, JPEG, or PNG files for Smart Capture.',
      'Click “Extract Fields” to continue using the structured output template below.',
    ].join('\n'));
    setMessage(`Single document upload detected. ${file.name} is ready for Smart Capture extraction.`);
    if (selectedSample) {
      setResult(selectedSample.extracted);
    }
  }

  function handleExtract() {
    if (!selectedSample || uploadMode === 'batch') return;
    setResult(parseRawText(rawText, selectedSample.extracted));
    setMessage('Document parsed. Extracted fields are ready for validation.');
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="app-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[22px] font-semibold tracking-tight text-slate-900">Document Capture</div>
            <div className="mt-1 text-sm text-slate-500">Upload image/PDF documents for single capture, or CSV/Excel files for batch upload.</div>
          </div>
          <label className="secondary-button h-10 px-4 text-sm whitespace-nowrap">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
              onChange={handleFileChange}
            />
            <AppIcon name="ImageUp" className="h-4 w-4" />
            Upload
          </label>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Accepted formats:</span>{' '}
          Document OCR ({acceptedDocumentTypes.join(', ')}) and Batch Upload ({acceptedBatchTypes.join(', ')}).
        </div>

        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Sample Document</span>
              <select className="input-field h-10" value={selectedId} onChange={(event) => handleSampleChange(event.target.value)}>
                {samples.map((sample) => <option key={sample.id} value={sample.id}>{sample.title}</option>)}
              </select>
            </label>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              <div className="font-medium text-slate-700">Why it matters</div>
              <div className="mt-2 leading-6">Smart Capture turns receiving documents into structured inventory updates before validation rules are applied. CSV/XLS/XLSX files are routed as batch uploads.</div>
            </div>
          </div>

          <div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">OCR Result</span>
              <textarea className="textarea-field min-h-[280px]" value={rawText} onChange={(event) => setRawText(event.target.value)} />
            </label>
            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
              <div className="text-sm leading-6 text-slate-500">{selectedSample?.note}</div>
              {uploadMode === 'document' ? (
                <button type="button" className="primary-button h-11 w-full px-6 text-sm whitespace-nowrap" onClick={handleExtract}>
                  Extract Fields
                </button>
              ) : (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
                  Batch upload mode detected. File will bypass single-document OCR and go straight to validation.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="app-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[22px] font-semibold tracking-tight text-slate-900">{uploadMode === 'batch' ? 'Batch Upload Summary' : 'Structured Output'}</div>
            <div className="mt-1 text-sm text-slate-500">
              {uploadMode === 'batch'
                ? 'Batch files are summarized before being sent to the validation queue.'
                : 'Check the parsed fields before sending them to the validation queue.'}
            </div>
          </div>
          <StatusBadge status={result.initialStatus} />
        </div>

        {uploadMode === 'batch' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultField label="Batch File" value={batchSummary?.fileName ?? '-'} />
            <ResultField label="Upload Mode" value="Batch Upload" />
            <ResultField label="File Type" value={batchSummary?.extension?.toUpperCase() ?? '-'} />
            <ResultField label="Estimated Rows" value={batchSummary?.estimatedRows != null ? String(batchSummary.estimatedRows) : 'Preview limited in demo'} />
            <ResultField label="Accepted Formats" value={acceptedBatchTypes.join(', ')} />
            <ResultField label="Routing" value="Validation Queue" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <ResultField label="Document" value={result.documentNo} />
            <ResultField label="Material Code" value={result.materialCode} />
            <ResultField label="Material" value={result.material} />
            <ResultField label="Supplier" value={result.supplier} />
            <ResultField label="Batch" value={result.batchNo} />
            <ResultField label="Quantity" value={`${result.quantity} ${result.unit}`} />
            <ResultField label="Location" value={result.locationSlot} />
            <ResultField label="Initial Status" value={result.initialStatus} />
          </div>
        )}

        {message ? <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

        <div className="mt-5 flex items-center justify-end gap-3">
          <Link href="/receiving/validation" className="primary-button h-11 px-6 text-sm whitespace-nowrap">Send to Validation Queue</Link>
        </div>
      </div>
    </div>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
