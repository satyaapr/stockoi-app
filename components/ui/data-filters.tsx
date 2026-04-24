import Link from 'next/link';
import type { QueryFilters } from '@/lib/types';

type Options = {
  statuses?: string[];
  locations?: string[];
  anomalies?: string[];
  sources?: string[];
};

type DataFiltersProps = {
  action: string;
  filters: QueryFilters;
  options: Options;
  searchPlaceholder?: string;
  showStatus?: boolean;
  showLocation?: boolean;
  showRisk?: boolean;
  showAnomaly?: boolean;
  showSource?: boolean;
  showDateRange?: boolean;
};

function FilterSelect({ name, defaultValue, options, label }: { name: string; defaultValue?: string; options: string[]; label: string }) {
  return (
    <label className="block min-w-[160px]">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <select name={name} defaultValue={defaultValue ?? 'all'} className="input-field h-10">
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function DataFilters({
  action,
  filters,
  options,
  searchPlaceholder = 'Search material, batch, location, or operator...',
  showStatus = true,
  showLocation = true,
  showRisk = true,
  showAnomaly = true,
  showSource = true,
  showDateRange = false,
}: DataFiltersProps) {
  const fieldsCount = [showStatus, showLocation, showRisk, showAnomaly, showSource, showDateRange].filter(Boolean).length;
  const gridClass = fieldsCount >= 5
    ? 'xl:grid-cols-[minmax(0,1.4fr)_repeat(6,minmax(120px,1fr))_auto]'
    : 'xl:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(140px,1fr))_auto]';

  return (
    <form action={action} className="app-card mb-5 p-4">
      <div className={`grid gap-3 ${gridClass} xl:items-end`}>
        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Search</span>
          <input name="query" defaultValue={filters.query ?? ''} placeholder={searchPlaceholder} className="input-field h-10" />
        </label>

        {showStatus ? <FilterSelect name="status" defaultValue={filters.status} options={options.statuses ?? []} label="Status" /> : null}
        {showLocation ? <FilterSelect name="location" defaultValue={filters.location} options={options.locations ?? []} label="Location" /> : null}
        {showRisk ? <FilterSelect name="risk" defaultValue={filters.risk} options={['low', 'medium', 'high']} label="Risk" /> : null}
        {showAnomaly ? <FilterSelect name="anomaly" defaultValue={filters.anomaly} options={(options.anomalies ?? []).filter((item) => item !== 'none')} label="Anomaly" /> : null}
        {showSource ? <FilterSelect name="source" defaultValue={filters.source} options={options.sources ?? []} label="Source" /> : null}

        {showDateRange ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:col-span-2">
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Date From</span>
              <input type="date" name="dateFrom" defaultValue={filters.dateFrom ?? ''} className="input-field h-10" />
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Date To</span>
              <input type="date" name="dateTo" defaultValue={filters.dateTo ?? ''} className="input-field h-10" />
            </label>
          </div>
        ) : null}

        <div className="flex gap-2 xl:justify-end">
          <button type="submit" className="primary-button h-10 px-4 text-sm">Apply</button>
          <Link href={action} className="secondary-button h-10 px-4 text-sm">Reset</Link>
        </div>
      </div>
    </form>
  );
}
