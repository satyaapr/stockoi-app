import type { AnomalySeverity, DisplayStatus, RiskBucket } from '@/lib/types';

export const STATUS_ORDER: DisplayStatus[] = ['Unreleased', 'On Hold', 'Reject', 'Released'];

export const STATUS_META: Record<DisplayStatus | 'Total Material', {
  accent: string;
  surface: string;
  track: string;
  icon: string;
}> = {
  Unreleased: {
    accent: '#2F6EF2',
    surface: '#EEF4FF',
    track: '#C9DBFF',
    icon: 'Package',
  },
  'On Hold': {
    accent: '#F2B31B',
    surface: '#FFF7E7',
    track: '#F5D790',
    icon: 'Lock',
  },
  Reject: {
    accent: '#E55353',
    surface: '#FFF1F1',
    track: '#F1BCBC',
    icon: 'FileX2',
  },
  Released: {
    accent: '#28B264',
    surface: '#EBFBF2',
    track: '#BFE8CE',
    icon: 'BadgeCheck',
  },
  'Total Material': {
    accent: '#111827',
    surface: '#F7F7F7',
    track: '#CBD5E1',
    icon: 'Layers3',
  },
};

export const RISK_META: Record<RiskBucket, { accent: string; surface: string; label: string }> = {
  low: {
    accent: '#28B264',
    surface: '#EBFBF2',
    label: 'Low Risk',
  },
  medium: {
    accent: '#F2B31B',
    surface: '#FFF7E7',
    label: 'Medium Risk',
  },
  high: {
    accent: '#E55353',
    surface: '#FFF1F1',
    label: 'High Risk',
  },
};

export const ANOMALY_META: Record<string, {
  title: string;
  severity: AnomalySeverity;
  accent: string;
  surface: string;
  icon: string;
}> = {
  none: {
    title: 'Normal Record',
    severity: 'low',
    accent: '#28B264',
    surface: '#EBFBF2',
    icon: 'ShieldCheck',
  },
  duplicate_entry: {
    title: 'Duplicate Status Detected',
    severity: 'high',
    accent: '#E55353',
    surface: '#FFF1F1',
    icon: 'AlertTriangle',
  },
  missing_field: {
    title: 'Incomplete Data',
    severity: 'medium',
    accent: '#F2B31B',
    surface: '#FFF7E7',
    icon: 'AlertTriangle',
  },
  invalid_location: {
    title: 'Abnormal Movement',
    severity: 'high',
    accent: '#E55353',
    surface: '#FFF1F1',
    icon: 'MapPinOff',
  },
  aging_on_hold: {
    title: 'Long Hold Material',
    severity: 'medium',
    accent: '#F2B31B',
    surface: '#FFF7E7',
    icon: 'Clock3',
  },
  quantity_anomaly: {
    title: 'Quantity Anomaly',
    severity: 'medium',
    accent: '#F2B31B',
    surface: '#FFF7E7',
    icon: 'BarChart3',
  },
  status_conflict: {
    title: 'Status Conflict',
    severity: 'high',
    accent: '#E55353',
    surface: '#FFF1F1',
    icon: 'GitBranch',
  },
};
