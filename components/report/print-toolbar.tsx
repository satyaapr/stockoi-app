'use client';

export function PrintToolbar() {
  return (
    <div className="no-print sticky top-0 z-20 flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-6 py-4">
      <button type="button" className="secondary-button h-10 px-4 text-sm" onClick={() => window.close()}>
        Close
      </button>
      <button type="button" className="primary-button h-10 px-4 text-sm" onClick={() => window.print()}>
        Print / Save PDF
      </button>
    </div>
  );
}
