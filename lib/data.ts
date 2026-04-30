import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';
import { ANOMALY_META, STATUS_META, STATUS_ORDER } from '@/lib/theme';
import {
  clamp,
  compactNumber,
  formatDateInputValue,
  formatDateLabel,
  formatDateTimeLabel,
  formatTimeLabel,
  locationCodeFor,
  locationSlotFor,
  mapStatusToDisplayStatus,
  roleLabel,
  sourceLabel,
  toNumber,
} from '@/lib/format';
import type {
  AppBundle,
  CaptureSample,
  DisplayStatus,
  EnrichedAudit,
  EnrichedItem,
  EnrichedLocation,
  EnrichedTransaction,
  EnrichedUser,
  LocationMatrixRow,
  QueryFilters,
  RawAuditLog,
  RawInventoryTransaction,
  RawItemMaster,
  RawLocationMaster,
  RawUser,
  RawValidationResult,
  ReceivingEntry,
} from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data');

const SUPPLIER_BY_CATEGORY: Record<string, string> = {
  'Raw Material': 'PT Industri Maju Bersama',
  Packaging: 'PT Sinar Kemasan Nusantara',
  'Finished Goods': 'Internal Production Line',
  'Spare Parts': 'CV Teknik Prima Sejahtera',
  Unknown: 'PT Default Supplier Indonesia',
};

let cachedBundle: Promise<AppBundle> | null = null;

async function readCsv<T>(fileName: string): Promise<T[]> {
  const raw = await readFile(path.join(DATA_DIR, fileName), 'utf8');
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as T[];
}

function riskBucket(score: number) {
  if (score >= 70) return 'high' as const;
  if (score >= 40) return 'medium' as const;
  return 'low' as const;
}

function anomalyDescription(row: RawInventoryTransaction, itemName: string, anomalyType: string) {
  switch (anomalyType) {
    case 'duplicate_entry':
      return `Material “${itemName}” on batch ${row.batch_id} appears more than once in the current validation window.`;
    case 'missing_field':
      return `Receiving ${row.transaction_id} still contains incomplete information and needs operator confirmation.`;
    case 'invalid_location':
      return `Movement to ${row.location || 'unknown'} is not aligned with the material's standard storage rule.`;
    case 'aging_on_hold':
      return `Material “${itemName}” has remained On Hold longer than the allowed threshold.`;
    case 'quantity_anomaly':
      return `The quantity ${compactNumber(toNumber(row.quantity))} ${row.unit} looks abnormal for this item and batch.`;
    case 'status_conflict':
      return `Conflicting statuses were detected for batch ${row.batch_id}, so supervisor review is required.`;
    default:
      return 'This transaction passed validation checks and no major anomaly was detected.';
  }
}

function normalizeSearch(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function normalizeDate(value: string | undefined) {
  return value?.trim() ?? '';
}

function isWithinDateRange(timestamp: string, dateFrom?: string, dateTo?: string) {
  const dateKey = formatDateInputValue(timestamp);
  if (!dateKey) return true;
  if (dateFrom && dateKey < dateFrom) return false;
  if (dateTo && dateKey > dateTo) return false;
  return true;
}

function buildDateRangeForSingleDay(dateKey: string) {
  return {
    dateFrom: dateKey,
    dateTo: dateKey,
  };
}

export function normalizeFilters(input: Record<string, string | string[] | undefined>): QueryFilters {
  const take = (key: keyof QueryFilters | 'page' | 'timelinePage' | 'exceptionPage' | 'agingPage') => {
    const value = input[key as string];
    return Array.isArray(value) ? value[0] : value;
  };
  const legacySearch = input.search;

  const filters: QueryFilters = {
    query: take('query') ?? (Array.isArray(legacySearch) ? legacySearch[0] : legacySearch),
    status: take('status'),
    location: take('location'),
    risk: take('risk'),
    anomaly: take('anomaly'),
    source: take('source'),
    dateFrom: take('dateFrom'),
    dateTo: take('dateTo'),
  };

  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value && value !== 'all'),
  ) as QueryFilters;
}

export function applyTransactionFilters(transactions: EnrichedTransaction[], filters: QueryFilters) {
  const query = normalizeSearch(filters.query);
  const dateFrom = normalizeDate(filters.dateFrom);
  const dateTo = normalizeDate(filters.dateTo);

  return transactions.filter((row) => {
    if (filters.status && row.display_status !== filters.status) return false;
    if (filters.location && row.location !== filters.location) return false;
    if (filters.risk && row.risk_bucket !== filters.risk) return false;
    if (filters.anomaly && row.anomaly_type !== filters.anomaly) return false;
    if (filters.source && row.source_label !== filters.source) return false;
    if (!isWithinDateRange(row.timestamp, dateFrom, dateTo)) return false;
    if (
      query &&
      ![
        row.transaction_id,
        row.item_code,
        row.item_name,
        row.batch_id,
        row.location,
        row.location_code,
        row.location_slot,
        row.operator_name,
        row.anomaly_title,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    return true;
  });
}

function buildLocationMatrix(transactions: EnrichedTransaction[], locationNames: string[]): LocationMatrixRow[] {
  return locationNames
    .map((locationName) => {
      const rows = transactions.filter((row) => row.location === locationName);
      const countFor = (status: DisplayStatus) => rows.filter((row) => row.display_status === status).length;
      const total = rows.length;

      return {
        location_name: locationName,
        location_code: locationCodeFor(locationName),
        unreleased: countFor('Unreleased'),
        onHold: countFor('On Hold'),
        reject: countFor('Reject'),
        released: countFor('Released'),
        total,
      };
    })
    .filter((row) => row.total > 0)
    .sort((left, right) => right.total - left.total);
}

async function loadBundle(): Promise<AppBundle> {
  const [rawTransactions, rawValidations, rawItems, rawLocations, rawAudits, rawUsers] = await Promise.all([
    readCsv<RawInventoryTransaction>('inventory_transactions.csv'),
    readCsv<RawValidationResult>('validation_results.csv'),
    readCsv<RawItemMaster>('items_master.csv'),
    readCsv<RawLocationMaster>('location_master.csv'),
    readCsv<RawAuditLog>('audit_log.csv'),
    readCsv<RawUser>('users.csv'),
  ]);

  const validationByTransaction = new Map(rawValidations.map((row) => [row.transaction_id, row]));
  const itemByCode = new Map(rawItems.map((row) => [row.item_code, row]));
  const locationByName = new Map(rawLocations.map((row) => [row.location_name, row]));

  const transactions: EnrichedTransaction[] = rawTransactions
    .map((row) => {
      const validation = validationByTransaction.get(row.transaction_id);
      const item = itemByCode.get(row.item_code);
      const location = locationByName.get(row.location);
      const riskScore = clamp(toNumber(validation?.risk_score), 0, 100);
      const displayStatus = mapStatusToDisplayStatus(row.status);
      const recommendedDisplayStatus = mapStatusToDisplayStatus(validation?.recommended_status ?? row.status);
      const anomalyType = validation?.anomaly_type ?? 'none';
      const anomalyMeta = ANOMALY_META[anomalyType] ?? ANOMALY_META.none;
      const category = item?.category ?? 'Unknown';
      const supplierName = SUPPLIER_BY_CATEGORY[category] ?? SUPPLIER_BY_CATEGORY.Unknown;

      return {
        ...row,
        unit: row.unit || item?.unit || 'pcs',
        item_name: item?.item_name ?? row.item_code,
        category,
        standard_storage_location: item?.standard_storage_location ?? row.location,
        standard_location_code: locationCodeFor(item?.standard_storage_location ?? row.location),
        max_hold_days: toNumber(item?.max_hold_days),
        requires_quality_check: (item?.requires_quality_check ?? 'no') === 'yes',
        allowed_status: item?.allowed_status ?? row.status,
        supplier_name: supplierName,
        display_status: displayStatus,
        recommended_display_status: recommendedDisplayStatus,
        risk_score_number: riskScore,
        completeness_score_number: clamp(toNumber(validation?.completeness_score), 0, 100),
        risk_bucket: riskBucket(riskScore),
        quantity_number: toNumber(row.quantity),
        anomaly_title: anomalyMeta.title,
        anomaly_description: anomalyDescription(row, item?.item_name ?? row.item_code, anomalyType),
        anomaly_severity: anomalyMeta.severity,
        location_code: locationCodeFor(row.location),
        location_slot: locationSlotFor(row.location, row.batch_id),
        source_label: sourceLabel(row.source_type),
        created_date_label: formatDateLabel(row.timestamp),
        created_time_label: formatTimeLabel(row.timestamp),
        timestamp_label: formatDateTimeLabel(row.timestamp),
        location_type: location?.location_type ?? '-',
        allowed_categories: location?.allowed_categories ?? '-',
        restricted_status: location?.restricted_status ?? '-',
        validation_id: validation?.validation_id ?? `VAL-${row.transaction_id}`,
        duplicate_flag: validation?.duplicate_flag ?? 'no',
        completeness_score: validation?.completeness_score ?? '0',
        location_consistency_flag: validation?.location_consistency_flag ?? 'ok',
        aging_flag: validation?.aging_flag ?? 'no',
        recommended_status: validation?.recommended_status ?? row.status,
        risk_score: validation?.risk_score ?? String(riskScore),
        anomaly_type: anomalyType,
        ai_explanation:
          validation?.ai_explanation ?? 'No AI explanation is available yet for this transaction.',
        date_key: formatDateInputValue(row.timestamp),
      };
    })
    .sort((left, right) => +new Date(right.timestamp) - +new Date(left.timestamp));

  const transactionKeyMap = new Map(
    transactions.map((row) => [`${row.item_code}__${row.batch_id}`, row]),
  );

  const audits: EnrichedAudit[] = rawAudits
    .map((log) => {
      const linked = transactionKeyMap.get(`${log.item_code}__${log.batch_id}`);
      return {
        ...log,
        item_name: linked?.item_name ?? log.item_code,
        location_name: linked?.location ?? 'Unknown',
        location_code: locationCodeFor(linked?.location ?? ''),
        location_slot: locationSlotFor(linked?.location ?? '', log.batch_id),
        previous_display_status: mapStatusToDisplayStatus(log.previous_status),
        new_display_status: mapStatusToDisplayStatus(log.new_status),
        timestamp_label: formatDateTimeLabel(log.timestamp),
        date_label: formatDateLabel(log.timestamp),
        time_label: formatTimeLabel(log.timestamp),
        date_key: formatDateInputValue(log.timestamp),
      };
    })
    .sort((left, right) => +new Date(right.timestamp) - +new Date(left.timestamp));

  const items: EnrichedItem[] = rawItems
    .map((item) => {
      const rows = transactions.filter((row) => row.item_code === item.item_code);
      return {
        ...item,
        supplier_name: SUPPLIER_BY_CATEGORY[item.category] ?? SUPPLIER_BY_CATEGORY.Unknown,
        active_transactions: rows.length,
        anomaly_count: rows.filter((row) => row.anomaly_type !== 'none').length,
        released_count: rows.filter((row) => row.display_status === 'Released').length,
        standard_location_code: locationCodeFor(item.standard_storage_location),
      };
    })
    .sort((left, right) => right.active_transactions - left.active_transactions || left.item_code.localeCompare(right.item_code));

  const locations: EnrichedLocation[] = rawLocations
    .map((location) => {
      const rows = transactions.filter((row) => row.location === location.location_name);
      return {
        ...location,
        location_code: locationCodeFor(location.location_name),
        active_transactions: rows.length,
        anomaly_count: rows.filter((row) => row.anomaly_type !== 'none').length,
        on_hold_count: rows.filter((row) => row.display_status === 'On Hold').length,
        released_count: rows.filter((row) => row.display_status === 'Released').length,
      };
    })
    .sort((left, right) => right.active_transactions - left.active_transactions || left.location_id.localeCompare(right.location_id));

  const users: EnrichedUser[] = rawUsers
    .map((user) => {
      const handled = transactions.filter((row) => row.operator_name === user.name);
      const approvals = audits.filter((log) => log.approved_by === user.name);
      return {
        ...user,
        display_role: roleLabel(user.role),
        assigned_location_code: locationCodeFor(user.assigned_location),
        handled_transactions: handled.length,
        approval_count: approvals.length,
      };
    })
    .sort((left, right) => right.handled_transactions - left.handled_transactions || left.name.localeCompare(right.name));

  return {
    transactions,
    audits,
    items,
    locations,
    users,
    filters: {
      statuses: STATUS_ORDER,
      locations: Array.from(new Set(transactions.map((row) => row.location))).sort(),
      anomalies: Array.from(new Set(transactions.map((row) => row.anomaly_type))).sort(),
      sources: Array.from(new Set(transactions.map((row) => row.source_label))).sort(),
      availableDates: Array.from(new Set(transactions.map((row) => row.date_key))).sort().reverse(),
    },
  };
}

export async function getBundle() {
  if (!cachedBundle) {
    cachedBundle = loadBundle();
  }
  return cachedBundle;
}

export async function getLayoutContext() {
  const bundle = await getBundle();
  const latestTimestamp = bundle.transactions[0]?.timestamp ?? new Date().toISOString();
  const highSeverityTransactions = bundle.transactions.filter((row) => row.anomaly_severity === 'high');
  const notificationItems = highSeverityTransactions
    .slice(0, 4)
    .map((row) => ({
      id: row.transaction_id,
      title: row.anomaly_title,
      subtitle: `${row.item_name} • ${row.batch_id} • ${row.location_slot}`,
      time: row.created_time_label,
      href: `/review/${row.transaction_id}`,
    }));

  return {
    timestampLabel: formatDateTimeLabel(latestTimestamp),
    notifications: highSeverityTransactions.length,
    notificationItems,
    helpLinks: [
      {
        label: 'Receiving Automation',
        description: 'Upload document images, PDFs, or batch files before sending them to validation.',
        href: '/receiving/receiving-automation',
      },
      {
        label: 'Validation Queue',
        description: 'Review AI recommendations, risk score, anomaly type, and source for each flagged transaction.',
        href: '/receiving/validation',
      },
      {
        label: 'Validation Report',
        description: 'Print the final material status snapshot for a selected reporting date.',
        href: '/reporting/validation-report',
      },
    ],
    userName: 'Andi Pratama',
    userRole: 'Warehouse Admin',
  };
}

function buildStatusCards(transactions: EnrichedTransaction[]) {
  const total = transactions.length;
  const statusCards = STATUS_ORDER.map((status) => {
    const count = transactions.filter((row) => row.display_status === status).length;
    const meta = STATUS_META[status];
    return {
      label: status,
      count,
      share: total ? (count / total) * 100 : 0,
      accent: meta.accent,
      surface: meta.surface,
      track: meta.track,
      icon: meta.icon,
    };
  });

  const totalMeta = STATUS_META['Total Material'];
  const totalCard = {
    label: 'Total Material' as const,
    count: total,
    share: 100,
    accent: totalMeta.accent,
    surface: totalMeta.surface,
    track: totalMeta.track,
    icon: totalMeta.icon,
  };

  return { statusCards, totalCard };
}

function buildDonutSegments(transactions: EnrichedTransaction[]) {
  const total = transactions.length;
  return STATUS_ORDER.map((status) => {
    const value = transactions.filter((row) => row.display_status === status).length;
    return {
      label: status,
      value,
      share: total ? (value / total) * 100 : 0,
      color: STATUS_META[status].accent,
    };
  });
}

function paginateRows<T>(rows: T[], requestedPage: number, pageSize: number) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = clamp(requestedPage, 1, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    rows: rows.slice(startIndex, endIndex),
    currentPage,
    totalPages,
    total,
    startIndex,
    endIndex: Math.min(total, endIndex),
    pageSize,
  };
}

function buildReceivingDefault(bundle: AppBundle): ReceivingEntry {
  const reference = bundle.transactions[0];
  const material = bundle.items[0];
  const locationName = reference?.location ?? material?.standard_storage_location ?? bundle.locations[0]?.location_name ?? 'Warehouse 01';
  const itemName = reference?.item_name ?? material?.item_name ?? 'Material';
  const itemCode = reference?.item_code ?? material?.item_code ?? 'RM-0001';
  const dateValue = reference?.timestamp ? new Date(reference.timestamp) : new Date();
  const documentDate = `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, '0')}-${String(dateValue.getDate()).padStart(2, '0')}`;
  return {
    documentNo: `RCV-${documentDate}-${String(dateValue.getHours()).padStart(2, '0')}${String(dateValue.getMinutes()).padStart(2, '0')}`,
    receivingDate: `${documentDate}T${String(dateValue.getHours()).padStart(2, '0')}:${String(dateValue.getMinutes()).padStart(2, '0')}`,
    supplier: reference?.supplier_name ?? SUPPLIER_BY_CATEGORY[material?.category ?? 'Unknown'] ?? SUPPLIER_BY_CATEGORY.Unknown,
    material: itemName,
    materialCode: itemCode,
    batchNo: reference?.batch_id ?? 'B-01-001',
    quantity: String(reference?.quantity_number ?? 125),
    unit: reference?.unit ?? material?.unit ?? 'pcs',
    location: locationName,
    locationSlot: locationSlotFor(locationName, reference?.batch_id ?? 'B-01-001'),
    initialStatus: 'Unreleased',
  };
}

function filterAudits(audits: EnrichedAudit[], filters: QueryFilters) {
  const query = normalizeSearch(filters.query);
  const dateFrom = normalizeDate(filters.dateFrom);
  const dateTo = normalizeDate(filters.dateTo);

  return audits.filter((log) => {
    if (filters.status && log.new_display_status !== filters.status) return false;
    if (filters.location && log.location_name !== filters.location) return false;
    if (!isWithinDateRange(log.timestamp, dateFrom, dateTo)) return false;
    if (
      query &&
      ![
        log.log_id,
        log.item_name,
        log.item_code,
        log.batch_id,
        log.changed_by,
        log.approved_by,
        log.location_code,
        log.location_slot,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    return true;
  });
}

function buildStatusInsights(transactions: EnrichedTransaction[], locationMatrix: LocationMatrixRow[]) {
  const { statusCards } = buildStatusCards(transactions);
  const leadingStatus = [...statusCards].sort((left, right) => right.count - left.count)[0];
  const busiestLocation = locationMatrix[0];
  const anomalyCount = transactions.filter((row) => row.anomaly_type !== 'none').length;
  const holdCount = transactions.filter((row) => row.display_status === 'On Hold').length;

  return [
    {
      label: 'Dominant Status',
      value: leadingStatus ? `${leadingStatus.label}` : '-',
      hint: leadingStatus ? `${leadingStatus.count} items in the current filtered scope.` : 'No status data available.',
    },
    {
      label: 'Anomaly Watch',
      value: `${anomalyCount}`,
      hint: `${holdCount} materials are currently on hold and should be monitored closely.`,
    },
    {
      label: 'Busiest Location',
      value: busiestLocation?.location_code ?? '-',
      hint: busiestLocation ? `${busiestLocation.total} active materials in ${busiestLocation.location_name}.` : 'No active location found.',
    },
  ];
}

export async function getDashboardModel(filters: QueryFilters = {}) {
  const bundle = await getBundle();
  const filtered = applyTransactionFilters(bundle.transactions, filters);
  const { statusCards, totalCard } = buildStatusCards(filtered);
  const anomalyFeed = filtered
    .filter((row) => row.anomaly_type !== 'none')
    .sort((left, right) => right.risk_score_number - left.risk_score_number || +new Date(right.timestamp) - +new Date(left.timestamp))
    .slice(0, 4);
  const locationMatrix = buildLocationMatrix(filtered, bundle.filters.locations);
  const receivingActivity = filtered.slice(0, 5);
  const receivingSourceMix = bundle.filters.sources
    .map((source) => ({
      label: source,
      count: filtered.filter((row) => row.source_label === source).length,
    }))
    .filter((row) => row.count > 0)
    .sort((left, right) => right.count - left.count);

  return {
    filters: bundle.filters,
    statusCards,
    totalCard,
    donutSegments: buildDonutSegments(filtered),
    anomalyFeed,
    locationMatrix,
    timeline: bundle.audits.slice(0, 4),
    recentMaterials: filtered.slice(0, 5),
    receivingActivity,
    receivingSourceMix,
    metrics: {
      total: filtered.length,
      anomalies: filtered.filter((row) => row.anomaly_type !== 'none').length,
      highRisk: filtered.filter((row) => row.risk_bucket === 'high').length,
      avgRisk: filtered.length ? Math.round(filtered.reduce((sum, row) => sum + row.risk_score_number, 0) / filtered.length) : 0,
    },
  };
}

export async function getDigitalReceivingModel() {
  const bundle = await getBundle();
  return {
    filters: bundle.filters,
    receivingDefault: buildReceivingDefault(bundle),
    suppliers: Array.from(new Set(bundle.items.map((item) => item.supplier_name))).sort(),
    materials: bundle.items.map((item) => ({
      label: item.item_name,
      value: item.item_code,
      unit: item.unit,
      supplier: item.supplier_name,
      location: item.standard_storage_location,
    })),
    recentEntries: bundle.transactions.slice(0, 10),
    stats: {
      total: bundle.transactions.length,
      receivingAutomation: bundle.transactions.filter((row) => row.source_label === 'Receiving Automation').length,
      pendingReview: bundle.transactions.filter((row) => row.display_status === 'Unreleased').length,
    },
  };
}

function buildCaptureSampleFromTransaction(row: EnrichedTransaction): CaptureSample {
  const entry: ReceivingEntry = {
    documentNo: `DOC-${row.transaction_id}`,
    receivingDate: row.timestamp.replace(' ', 'T').slice(0, 16),
    supplier: row.supplier_name,
    material: row.item_name,
    materialCode: row.item_code,
    batchNo: row.batch_id,
    quantity: String(row.quantity_number),
    unit: row.unit,
    location: row.location,
    locationSlot: row.location_slot,
    initialStatus: row.display_status,
  };

  return {
    id: row.transaction_id,
    title: `${row.item_name} • ${row.batch_id}`,
    rawText: [
      `Receiving Document: DOC-${row.transaction_id}`,
      `Material: ${row.item_name} (${row.item_code})`,
      `Supplier: ${row.supplier_name}`,
      `Batch: ${row.batch_id}`,
      `Qty: ${row.quantity_number} ${row.unit}`,
      `Location: ${row.location_slot}`,
      `Initial Status: ${row.display_status}`,
      `Captured via ${row.source_label}`,
    ].join('\n'),
    extracted: entry,
    note: row.ai_explanation,
  };
}

export async function getReceivingAutomationModel() {
  const bundle = await getBundle();
  const samples = bundle.transactions
    .filter((row) => row.source_label === 'Receiving Automation' || row.anomaly_type !== 'none')
    .slice(0, 6)
    .map(buildCaptureSampleFromTransaction);

  return {
    samples,
    suggestedQueueCount: bundle.transactions.filter((row) => row.anomaly_type !== 'none').length,
    extractionAccuracy: 96,
    latestDocument: samples[0]?.title ?? 'No document selected',
    acceptedDocumentTypes: ['PDF', 'JPG', 'JPEG', 'PNG'],
    acceptedBatchTypes: ['CSV', 'XLS', 'XLSX'],
  };
}

export async function getValidationModel(filters: QueryFilters = {}, requestedPage = 1, pageSize = 5) {
  const bundle = await getBundle();
  const filtered = applyTransactionFilters(bundle.transactions, filters);
  const queue = filtered
    .filter((row) => row.anomaly_type !== 'none' || row.risk_bucket !== 'low' || row.display_status !== row.recommended_display_status)
    .sort((left, right) => right.risk_score_number - left.risk_score_number || +new Date(right.timestamp) - +new Date(left.timestamp));
  const pagination = paginateRows(queue, requestedPage, pageSize);

  return {
    filters: bundle.filters,
    queue: pagination.rows,
    pagination,
    latest: queue.slice(0, 5),
    metrics: {
      total: filtered.length,
      flagged: filtered.filter((row) => row.anomaly_type !== 'none').length,
      highRisk: filtered.filter((row) => row.risk_bucket === 'high').length,
      statusChange: filtered.filter((row) => row.display_status !== row.recommended_display_status).length,
    },
  };
}

export async function getReviewModel(transactionId: string) {
  const bundle = await getBundle();
  const transaction = bundle.transactions.find((row) => row.transaction_id === transactionId) ?? null;

  if (!transaction) {
    return null;
  }

  const relatedAudit = bundle.audits.filter(
    (log) => log.item_code === transaction.item_code && log.batch_id === transaction.batch_id,
  );

  const siblingTransactions = bundle.transactions
    .filter((row) => row.item_code === transaction.item_code && row.batch_id === transaction.batch_id)
    .slice(0, 8);

  return {
    transaction,
    relatedAudit,
    siblingTransactions,
    metrics: {
      risk: transaction.risk_score_number,
      completeness: transaction.completeness_score_number,
      reviewCount: siblingTransactions.length,
      auditCount: relatedAudit.length,
    },
  };
}

export async function getStatusBoardModel(filters: QueryFilters = {}, requestedPage = 1, pageSize = 10) {
  const bundle = await getBundle();
  const filtered = applyTransactionFilters(bundle.transactions, filters);
  const { statusCards, totalCard } = buildStatusCards(filtered);
  const locationMatrix = buildLocationMatrix(filtered, bundle.filters.locations);
  const recentMaterialsPagination = paginateRows(filtered, requestedPage, pageSize);

  return {
    filters: bundle.filters,
    statusCards,
    totalCard,
    donutSegments: buildDonutSegments(filtered),
    locationMatrix,
    distributionInsights: buildStatusInsights(filtered, locationMatrix),
    recentMaterials: recentMaterialsPagination.rows,
    recentMaterialsPagination,
  };
}

export async function getAlertAnomalyModel(filters: QueryFilters = {}, requestedPage = 1, pageSize = 5) {
  const bundle = await getBundle();
  const filtered = applyTransactionFilters(bundle.transactions, filters)
    .filter((row) => row.anomaly_type !== 'none')
    .sort((left, right) => right.risk_score_number - left.risk_score_number || +new Date(right.timestamp) - +new Date(left.timestamp));
  const pagination = paginateRows(filtered, requestedPage, pageSize);

  const grouped = bundle.filters.anomalies
    .filter((type) => type !== 'none')
    .map((type) => ({
      type,
      count: filtered.filter((row) => row.anomaly_type === type).length,
      title: ANOMALY_META[type]?.title ?? type,
    }))
    .filter((row) => row.count > 0)
    .sort((left, right) => right.count - left.count);

  return {
    filters: bundle.filters,
    alerts: pagination.rows,
    pagination,
    summary: {
      total: filtered.length,
      high: filtered.filter((row) => row.anomaly_severity === 'high').length,
      medium: filtered.filter((row) => row.anomaly_severity === 'medium').length,
      low: filtered.filter((row) => row.anomaly_severity === 'low').length,
    },
    grouped,
    locations: buildLocationMatrix(filtered, bundle.filters.locations).slice(0, 6),
  };
}

export async function getMovementTimelineModel(filters: QueryFilters = {}, requestedPage = 1, pageSize = 7) {
  const bundle = await getBundle();
  const timeline = filterAudits(bundle.audits, filters);
  const pagination = paginateRows(timeline, requestedPage, pageSize);
  const relatedTransactions = applyTransactionFilters(bundle.transactions, filters).slice(0, 7);

  return {
    filters: bundle.filters,
    timeline: pagination.rows,
    pagination,
    summary: {
      total: timeline.length,
      movedToHold: timeline.filter((log) => log.new_display_status === 'On Hold').length,
      movedToRelease: timeline.filter((log) => log.new_display_status === 'Released').length,
      movedToReject: timeline.filter((log) => log.new_display_status === 'Reject').length,
    },
    recentTransactions: relatedTransactions,
  };
}

export async function getAuditTrailModel(
  filters: QueryFilters = {},
  timelinePage = 1,
  exceptionPage = 1,
  agingPage = 1,
) {
  const bundle = await getBundle();
  const timeline = filterAudits(bundle.audits, filters);
  const exceptionReport = applyTransactionFilters(bundle.transactions, filters)
    .filter((row) => row.anomaly_type !== 'none');
  const agingCases = applyTransactionFilters(bundle.transactions, filters)
    .filter((row) => row.aging_flag === 'yes')
    .sort((left, right) => right.risk_score_number - left.risk_score_number);

  const timelinePagination = paginateRows(timeline, timelinePage, 10);
  const exceptionPagination = paginateRows(exceptionReport, exceptionPage, 10);
  const agingPagination = paginateRows(agingCases, agingPage, 5);

  return {
    filters: bundle.filters,
    timeline: timelinePagination.rows,
    timelinePagination,
    exceptionReport: exceptionPagination.rows,
    exceptionPagination,
    agingCases: agingPagination.rows,
    agingPagination,
    metrics: {
      totalLogs: timeline.length,
      approvals: timeline.filter((log) => log.approved_by && log.approved_by !== '-').length,
      exceptions: exceptionReport.length,
    },
  };
}

export async function getMaterialMasterModel(filters: QueryFilters = {}) {
  const bundle = await getBundle();
  const query = normalizeSearch(filters.query);
  const materials = bundle.items.filter((item) => {
    if (
      query &&
      ![item.item_code, item.item_name, item.category, item.supplier_name, item.standard_storage_location]
        .join(' ')
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    return true;
  });

  return {
    materials,
    metrics: {
      total: materials.length,
      active: materials.filter((item) => item.active_transactions > 0).length,
      withAnomalies: materials.filter((item) => item.anomaly_count > 0).length,
    },
  };
}

export async function getLocationMasterModel(filters: QueryFilters = {}) {
  const bundle = await getBundle();
  const query = normalizeSearch(filters.query);
  const locations = bundle.locations.filter((location) => {
    if (
      query &&
      ![location.location_name, location.location_code, location.location_type, location.allowed_categories]
        .join(' ')
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    return true;
  });
  return { locations };
}

export async function getUserManagementModel(filters: QueryFilters = {}) {
  const bundle = await getBundle();
  const query = normalizeSearch(filters.query);
  const users = bundle.users.filter((user) => {
    if (
      query &&
      ![user.name, user.display_role, user.assigned_location, user.assigned_location_code]
        .join(' ')
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }
    return true;
  });
  return { users };
}

function normalizeReportDateRange(startDate?: string, endDate?: string) {
  const fallback = formatDateInputValue(new Date());
  const safeStart = startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate) ? startDate : fallback;
  const safeEnd = endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate) ? endDate : safeStart;

  if (safeStart > safeEnd) {
    return { startDate: safeEnd, endDate: safeStart };
  }

  return { startDate: safeStart, endDate: safeEnd };
}

function formatReportRangeLabel(startDate: string, endDate: string) {
  const startLabel = formatDateLabel(`${startDate}T00:00:00`);
  const endLabel = formatDateLabel(`${endDate}T00:00:00`);
  return startDate === endDate ? startLabel : `${startLabel} - ${endLabel}`;
}

export async function getValidationReportModel(startDateParam?: string, endDateParam?: string) {
  const bundle = await getBundle();
  const latestAvailableDate = bundle.filters.availableDates[0] ?? formatDateInputValue(new Date());
  const legacySingleDate = startDateParam && !endDateParam ? startDateParam : undefined;
  const { startDate, endDate } = normalizeReportDateRange(
    legacySingleDate ?? startDateParam ?? latestAvailableDate,
    endDateParam ?? legacySingleDate ?? latestAvailableDate,
  );

  const snapshotCandidates = bundle.transactions
    .filter((row) => row.date_key >= startDate && row.date_key <= endDate)
    .sort((left, right) => +new Date(right.timestamp) - +new Date(left.timestamp));

  const snapshotMap = new Map<string, EnrichedTransaction>();
  for (const row of snapshotCandidates) {
    const key = `${row.item_code}__${row.batch_id}`;
    if (!snapshotMap.has(key)) {
      snapshotMap.set(key, row);
    }
  }

  const snapshotRows = Array.from(snapshotMap.values()).sort(
    (left, right) => +new Date(right.timestamp) - +new Date(left.timestamp),
  );

  const { statusCards, totalCard } = buildStatusCards(snapshotRows);
  const reportRangeLabel = formatReportRangeLabel(startDate, endDate);

  return {
    reportDate: endDate,
    reportDateLabel: reportRangeLabel,
    reportStartDate: startDate,
    reportEndDate: endDate,
    reportStartDateLabel: formatDateLabel(`${startDate}T00:00:00`),
    reportEndDateLabel: formatDateLabel(`${endDate}T00:00:00`),
    availableDates: bundle.filters.availableDates,
    rows: snapshotRows,
    statusCards,
    totalCard,
    summary: {
      total: snapshotRows.length,
      anomalies: snapshotRows.filter((row) => row.anomaly_type !== 'none').length,
      highRisk: snapshotRows.filter((row) => row.risk_bucket === 'high').length,
      released: snapshotRows.filter((row) => row.display_status === 'Released').length,
    },
    printHref: `/reporting/validation-report/print?from=${startDate}&to=${endDate}`,
    filterDefaults: {
      dateFrom: startDate,
      dateTo: endDate,
    },
  };
}
