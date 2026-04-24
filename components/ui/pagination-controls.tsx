import Link from 'next/link';
import { AppIcon } from '@/components/ui/icon';

type Params = Record<string, string | number | undefined>;

type PaginationControlsProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  params?: Params;
  pageParam?: string;
  className?: string;
};

function buildHref(basePath: string, params: Params, page: number, pageParam: string) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === 'all') return;
    searchParams.set(key, String(value));
  });

  searchParams.delete(pageParam);
  if (page > 1) {
    searchParams.set(pageParam, String(page));
  }

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function PaginationControls({
  basePath,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  params = {},
  pageParam = 'page',
  className = '',
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className={`mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}>
      <div className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{start}-{end}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Link
          href={buildHref(basePath, params, currentPage - 1, pageParam)}
          aria-disabled={currentPage <= 1}
          className={`secondary-button h-10 gap-2 px-4 text-sm ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
        >
          <AppIcon name="ChevronLeft" className="h-4 w-4" />
          Prev
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          Page {currentPage} / {totalPages}
        </div>
        <Link
          href={buildHref(basePath, params, currentPage + 1, pageParam)}
          aria-disabled={currentPage >= totalPages}
          className={`secondary-button h-10 gap-2 px-4 text-sm ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
        >
          Next
          <AppIcon name="ChevronRight" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
