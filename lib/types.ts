export type RawInventoryTransaction = {
  transaction_id: string;
  timestamp: string;
  item_code: string;
  batch_id: string;
  quantity: string;
  unit: string;
  location: string;
  status: string;
  source_type: string;
  operator_name: string;
  note: string;
};

export type RawValidationResult = {
  validation_id: string;
  transaction_id: string;
  duplicate_flag: string;
  completeness_score: string;
  location_consistency_flag: string;
  aging_flag: string;
  recommended_status: string;
  risk_score: string;
  anomaly_type: string;
  ai_explanation: string;
};

export type RawItemMaster = {
  item_code: string;
  item_name: string;
  category: string;
  unit: string;
  standard_storage_location: string;
  allowed_status: string;
  max_hold_days: string;
  requires_quality_check: string;
};

export type RawLocationMaster = {
  location_id: string;
  location_name: string;
  location_type: string;
  allowed_categories: string;
  restricted_status: string;
};

export type RawAuditLog = {
  log_id: string;
  timestamp: string;
  item_code: string;
  batch_id: string;
  previous_status: string;
  new_status: string;
  changed_by: string;
  reason: string;
  approved_by: string;
};

export type RawUser = {
  user_id: string;
  name: string;
  role: string;
  assigned_location: string;
};

export type DisplayStatus = 'Unreleased' | 'On Hold' | 'Reject' | 'Released';
export type RiskBucket = 'low' | 'medium' | 'high';
export type AnomalySeverity = 'low' | 'medium' | 'high';

export type QueryFilters = {
  query?: string;
  status?: string;
  location?: string;
  risk?: string;
  anomaly?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type EnrichedTransaction = RawInventoryTransaction & {
  validation_id: string;
  duplicate_flag: string;
  completeness_score: string;
  completeness_score_number: number;
  location_consistency_flag: string;
  aging_flag: string;
  recommended_status: string;
  recommended_display_status: DisplayStatus;
  risk_score: string;
  risk_score_number: number;
  risk_bucket: RiskBucket;
  anomaly_type: string;
  anomaly_title: string;
  anomaly_description: string;
  anomaly_severity: AnomalySeverity;
  ai_explanation: string;
  item_name: string;
  category: string;
  supplier_name: string;
  standard_storage_location: string;
  standard_location_code: string;
  allowed_status: string;
  max_hold_days: number;
  requires_quality_check: boolean;
  display_status: DisplayStatus;
  quantity_number: number;
  location_code: string;
  location_slot: string;
  location_type: string;
  allowed_categories: string;
  restricted_status: string;
  source_label: string;
  created_date_label: string;
  created_time_label: string;
  timestamp_label: string;
  date_key: string;
};

export type EnrichedAudit = RawAuditLog & {
  item_name: string;
  location_name: string;
  location_code: string;
  location_slot: string;
  previous_display_status: DisplayStatus;
  new_display_status: DisplayStatus;
  timestamp_label: string;
  date_label: string;
  time_label: string;
  date_key: string;
};

export type EnrichedItem = RawItemMaster & {
  supplier_name: string;
  active_transactions: number;
  anomaly_count: number;
  released_count: number;
  standard_location_code: string;
};

export type EnrichedLocation = RawLocationMaster & {
  location_code: string;
  active_transactions: number;
  anomaly_count: number;
  on_hold_count: number;
  released_count: number;
};

export type EnrichedUser = RawUser & {
  display_role: string;
  assigned_location_code: string;
  handled_transactions: number;
  approval_count: number;
};

export type StatusCard = {
  label: DisplayStatus | 'Total Material';
  count: number;
  share: number;
  accent: string;
  surface: string;
  track: string;
  icon: string;
};

export type DonutSegment = {
  label: DisplayStatus;
  value: number;
  share: number;
  color: string;
};

export type LocationMatrixRow = {
  location_name: string;
  location_code: string;
  unreleased: number;
  onHold: number;
  reject: number;
  released: number;
  total: number;
};

export type DashboardMetric = {
  total: number;
  anomalies: number;
  highRisk: number;
  avgRisk: number;
};

export type AppBundle = {
  transactions: EnrichedTransaction[];
  audits: EnrichedAudit[];
  items: EnrichedItem[];
  locations: EnrichedLocation[];
  users: EnrichedUser[];
  filters: {
    statuses: DisplayStatus[];
    locations: string[];
    anomalies: string[];
    sources: string[];
    availableDates: string[];
  };
};

export type ReceivingEntry = {
  documentNo: string;
  receivingDate: string;
  supplier: string;
  material: string;
  materialCode: string;
  batchNo: string;
  quantity: string;
  unit: string;
  location: string;
  locationSlot: string;
  initialStatus: DisplayStatus;
};

export type CaptureSample = {
  id: string;
  title: string;
  rawText: string;
  extracted: ReceivingEntry;
  note: string;
};
