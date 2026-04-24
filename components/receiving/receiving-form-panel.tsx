'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { DisplayStatus, ReceivingEntry } from '@/lib/types';
import { StatusBadge } from '@/components/ui/status-badge';
import { AppIcon } from '@/components/ui/icon';

type MaterialOption = {
  label: string;
  value: string;
  unit: string;
  supplier: string;
  location: string;
};

type Props = {
  defaultEntry: ReceivingEntry;
  suppliers: string[];
  materials: MaterialOption[];
  compact?: boolean;
};

type FormState = ReceivingEntry;

function toInputDate(timestamp: string) {
  if (!timestamp) return '';
  if (timestamp.includes('T')) return timestamp.slice(0, 16);
  return new Date(timestamp).toISOString().slice(0, 16);
}

export function ReceivingFormPanel({ defaultEntry, suppliers, materials, compact = false }: Props) {
  const [form, setForm] = useState<FormState>({
    ...defaultEntry,
    receivingDate: toInputDate(defaultEntry.receivingDate),
  });
  const [message, setMessage] = useState<string | null>(null);

  const materialMap = useMemo(() => new Map(materials.map((item) => [item.value, item])), [materials]);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleMaterial(code: string) {
    const material = materialMap.get(code);
    if (!material) return;
    setForm((current) => ({
      ...current,
      materialCode: material.value,
      material: material.label,
      unit: material.unit,
      supplier: material.supplier,
      location: material.location,
    }));
  }

  function handleReset() {
    setForm({ ...defaultEntry, receivingDate: toInputDate(defaultEntry.receivingDate) });
    setMessage(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(`Receiving ${form.documentNo} captured locally and is ready for validation.`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={`grid gap-3 ${compact ? '' : 'md:grid-cols-2'}`}>
        <Field label="Document No.">
          <div className="relative">
            <input className="input-field h-10 pr-10" value={form.documentNo} onChange={(event) => handleChange('documentNo', event.target.value)} />
            <span className="absolute inset-y-0 right-3 grid place-items-center text-slate-400">
              <AppIcon name="FileText" className="h-4 w-4" />
            </span>
          </div>
        </Field>
        <Field label="Receiving Date">
          <input type="datetime-local" className="input-field h-10" value={form.receivingDate} onChange={(event) => handleChange('receivingDate', event.target.value)} />
        </Field>
        <Field label="Supplier">
          <select className="input-field h-10" value={form.supplier} onChange={(event) => handleChange('supplier', event.target.value)}>
            {suppliers.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}
          </select>
        </Field>
        <Field label="Material">
          <select className="input-field h-10" value={form.materialCode} onChange={(event) => handleMaterial(event.target.value)}>
            {materials.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </Field>
        <Field label="Batch No.">
          <input className="input-field h-10" value={form.batchNo} onChange={(event) => handleChange('batchNo', event.target.value)} />
        </Field>
        <Field label="Quantity">
          <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-2">
            <input className="input-field h-10" value={form.quantity} onChange={(event) => handleChange('quantity', event.target.value)} />
            <div className="input-field grid h-10 place-items-center bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{form.unit}</div>
          </div>
        </Field>
        <Field label="Location">
          <input className="input-field h-10" value={form.locationSlot} onChange={(event) => handleChange('locationSlot', event.target.value)} />
        </Field>
        <Field label="Initial Status">
          <select className="input-field h-10" value={form.initialStatus} onChange={(event) => handleChange('initialStatus', event.target.value as DisplayStatus)}>
            <option value="Unreleased">Unreleased</option>
            <option value="On Hold">On Hold</option>
            <option value="Reject">Reject</option>
            <option value="Released">Released</option>
          </select>
        </Field>
      </div>

      <Field label="Attachment / Photo">
        <label className="flex min-h-[92px] cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          <input type="file" className="hidden" />
          <div>
            <AppIcon name="Upload" className="mx-auto h-5 w-5 text-slate-400" />
            <div className="mt-2 font-medium text-slate-600">Drag &amp; drop file here or click to upload</div>
            <div className="mt-1 text-xs text-slate-400">JPG, PNG, PDF (Max. 5MB)</div>
          </div>
        </label>
      </Field>

      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <StatusBadge status={form.initialStatus} />
          <span>{form.material}</span>
        </div>
        <div className="flex gap-2">
          <button className="secondary-button h-10 px-6 text-sm" type="button" onClick={handleReset}>Reset</button>
          <button className="primary-button h-10 px-6 text-sm" type="submit">Submit</button>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}
