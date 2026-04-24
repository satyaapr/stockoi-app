'use client';

import { useState } from 'react';
import { AppIcon } from '@/components/ui/icon';

export function SettingsWorkspace() {
  const [settings, setSettings] = useState({
    anomalyNotifications: true,
    autoRefresh: true,
    compactTables: false,
    indonesianLocale: true,
  });
  const [saved, setSaved] = useState(false);

  function toggle(key: keyof typeof settings) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
    setSaved(false);
  }

  function save() {
    setSaved(true);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="app-card p-5">
        <div className="mb-4">
          <div className="text-[24px] font-semibold tracking-tight text-slate-900">Workspace Preferences</div>
          <div className="mt-1 text-sm text-slate-500">Configure the demo experience for operators and supervisors.</div>
        </div>

        <div className="space-y-3">
          <ToggleRow label="Anomaly notifications" description="Highlight high-severity anomalies on the dashboard header." value={settings.anomalyNotifications} onChange={() => toggle('anomalyNotifications')} />
          <ToggleRow label="Auto refresh status board" description="Keep the dashboard refreshed for the latest inventory activity." value={settings.autoRefresh} onChange={() => toggle('autoRefresh')} />
          <ToggleRow label="Compact data tables" description="Show tighter row spacing for dense operational data." value={settings.compactTables} onChange={() => toggle('compactTables')} />
          <ToggleRow label="Bahasa Indonesia locale" description="Use Indonesian date/time formatting in the workspace." value={settings.indonesianLocale} onChange={() => toggle('indonesianLocale')} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm text-slate-500">These settings are stored locally in demo mode.</div>
          <button className="primary-button h-10 px-5 text-sm" type="button" onClick={save}>Save Settings</button>
        </div>

        {saved ? <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Settings saved locally for this demo session.</div> : null}
      </section>

      <section className="app-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEF4FF] text-[#2F6EF2]">
            <AppIcon name="Settings" className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[22px] font-semibold tracking-tight text-slate-900">Demo Environment</div>
            <div className="text-sm text-slate-500">Operational profile used for the current STOCK.OI prototype.</div>
          </div>
        </div>

        <div className="space-y-3">
          <InfoRow label="Workspace" value="Warehouse Operations - Demo" />
          <InfoRow label="Default Persona" value="Andi Pratama / Warehouse Admin" />
          <InfoRow label="Dataset Source" value="CSV bundle uploaded in the hackathon chat" />
          <InfoRow label="AI Mode" value="Rule-assisted validation + anomaly explanation" />
        </div>
      </section>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div>
        <div className="font-medium text-slate-900">{label}</div>
        <div className="mt-1 text-sm text-slate-500">{description}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full transition ${value ? 'bg-[#2F6EF2]' : 'bg-slate-300'}`}
        aria-pressed={value}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
