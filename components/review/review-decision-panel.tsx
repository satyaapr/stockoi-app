'use client';

import { useState, type FormEvent } from 'react';
import type { DisplayStatus } from '@/lib/types';

export function ReviewDecisionPanel({ recommendedStatus }: { recommendedStatus: DisplayStatus }) {
  const [decision, setDecision] = useState<DisplayStatus>(recommendedStatus);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(`Supervisor decision saved locally: ${decision}${note ? ` — ${note}` : ''}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Decision</span>
          <select className="input-field h-10" value={decision} onChange={(event) => setDecision(event.target.value as DisplayStatus)}>
            <option value="Unreleased">Unreleased</option>
            <option value="On Hold">On Hold</option>
            <option value="Reject">Reject</option>
            <option value="Released">Released</option>
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Recommended</span>
          <div className="input-field grid h-10 place-items-center bg-slate-50 text-sm font-medium text-slate-700">{recommendedStatus}</div>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Supervisor Note</span>
        <textarea className="textarea-field" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add disposition notes, next step, or approval context..." />
      </label>

      <div className="flex items-center justify-end gap-2">
        <button type="button" className="secondary-button h-10 px-4 text-sm" onClick={() => { setDecision(recommendedStatus); setNote(''); setMessage(null); }}>Reset</button>
        <button type="submit" className="primary-button h-10 px-4 text-sm">Save Decision</button>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
    </form>
  );
}
