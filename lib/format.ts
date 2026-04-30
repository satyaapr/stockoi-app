import type { DisplayStatus } from '@/lib/types';

export function toNumber(value: string | number | undefined | null) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const normalized = String(value ?? '').replace(/,/g, '').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function sentenceCase(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDateLabel(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatDateInputValue(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatTimeLabel(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatDateTimeLabel(value: string | Date) {
  return `${formatDateLabel(value)} • ${formatTimeLabel(value)} WIB`;
}

export function mapStatusToDisplayStatus(status: string): DisplayStatus {
  switch (status) {
    case 'Ready':
    case 'Released':
      return 'Released';
    case 'Need Review':
    case 'Unreleased':
      return 'Unreleased';
    case 'On Hold':
      return 'On Hold';
    case 'Reject':
      return 'Reject';
    default:
      return 'Unreleased';
  }
}

export function locationCodeFor(name: string) {
  const map: Record<string, string> = {
    'Warehouse 01': 'WH-01',
    'Warehouse 02': 'WH-02',
    'Warehouse 03': 'WH-03',
    'Inbound Dock': 'INB-01',
    'Finished Goods Zone': 'FG-01',
    'QA Hold Area': 'QA-01',
    'Packaging Zone': 'PK-01',
    'Dispatch Zone': 'DSP-01',
    'Maintenance Cage': 'MNT-01',
    'Yard A': 'YARD-A',
  };
  return map[name] ?? name.replace(/\s+/g, '-').toUpperCase();
}

export function locationSlotFor(name: string, batchId: string) {
  const prefixes: Record<string, string> = {
    'Warehouse 01': 'WH-01-A',
    'Warehouse 02': 'WH-02-B',
    'Warehouse 03': 'WH-03-C',
    'Inbound Dock': 'INB-01-R',
    'Finished Goods Zone': 'FG-01-D',
    'QA Hold Area': 'QA-01-H',
    'Packaging Zone': 'PK-01-P',
    'Dispatch Zone': 'DSP-01-L',
    'Maintenance Cage': 'MNT-01-S',
    'Yard A': 'YARD-A-Y',
  };
  const digits = batchId.replace(/\D/g, '');
  const suffix = digits ? digits.slice(-2).padStart(2, '0') : '01';
  return `${prefixes[name] ?? locationCodeFor(name)}-${suffix}`;
}

export function roleLabel(role: string) {
  switch (role) {
    case 'qa':
      return 'QA Officer';
    case 'supervisor':
      return 'Supervisor';
    case 'operator':
      return 'Warehouse Admin';
    default:
      return sentenceCase(role);
  }
}

export function sourceLabel(value: string) {
  switch (value) {
    case 'ocr_import':
      return 'Receiving Automation';
    case 'manual':
      return 'Manual Entry';
    case 'barcode_scan':
      return 'Barcode Scan';
    case 'batch_upload':
      return 'Batch Upload';
    default:
      return sentenceCase(value || 'manual');
  }
}
