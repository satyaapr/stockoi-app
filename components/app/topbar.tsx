'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppIcon } from '@/components/ui/icon';
import { PRODUCT_NAME } from '@/lib/navigation';

type TopbarNotice = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  href: string;
};

type HelpLink = {
  label: string;
  description: string;
  href: string;
};

type TopbarProps = {
  title: string;
  searchAction?: string;
  searchValue?: string;
  showSearch?: boolean;
  timestamp: string;
  notifications: number;
  notificationItems: TopbarNotice[];
  helpLinks: HelpLink[];
  userName: string;
  userRole: string;
};

function UserChip({ userName, userRole }: { userName: string; userRole: string }) {
  return (
    <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">AP</div>
      <div>
        <div className="text-sm font-semibold text-slate-900">{userName}</div>
        <div className="text-xs text-slate-500">{userRole}</div>
      </div>
      <AppIcon name="ChevronDown" className="h-4 w-4 text-slate-400" />
    </div>
  );
}

export function Topbar({
  title,
  searchAction = '/',
  searchValue,
  showSearch = false,
  timestamp,
  notifications,
  notificationItems,
  helpLinks,
  userName,
  userRole,
}: TopbarProps) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<'notifications' | 'help' | null>(null);

  function toggleMenu(menu: 'notifications' | 'help') {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  const actionButtons = (
    <div className="relative flex items-center gap-3 justify-end">
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu('notifications')}
          className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          aria-label="Open notifications"
        >
          <AppIcon name="Bell" className="h-5 w-5" />
          {notifications > 0 ? (
            <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E55353] px-1 text-[10px] font-semibold text-white">
              {notifications > 9 ? '9+' : notifications}
            </span>
          ) : null}
        </button>

        {openMenu === 'notifications' ? (
          <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_18px_36px_rgba(15,23,42,0.14)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Priority notifications</div>
                <div className="text-xs text-slate-500">Latest anomaly alerts that need attention.</div>
              </div>
              <Link href="/monitoring/alert-anomaly" className="text-xs font-semibold text-[#2F6EF2]" onClick={() => setOpenMenu(null)}>
                Open feed
              </Link>
            </div>

            <div className="space-y-3">
              {notificationItems.length > 0 ? notificationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpenMenu(null)}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.time}</div>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{item.subtitle}</div>
                </Link>
              )) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No active notifications in this demo dataset.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => toggleMenu('help')}
          className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          aria-label="Open quick help"
        >
          <AppIcon name="CircleHelp" className="h-5 w-5" />
        </button>

        {openMenu === 'help' ? (
          <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_18px_36px_rgba(15,23,42,0.14)]">
            <div className="mb-3">
              <div className="text-sm font-semibold text-slate-900">Quick help</div>
              <div className="text-xs text-slate-500">Jump to the core workflow pages in STOCK.OI.</div>
            </div>
            <div className="space-y-3">
              {helpLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpenMenu(null)}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <div className="font-medium text-slate-900">{item.label}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.description}</div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <UserChip userName={userName} userRole={userRole} />
    </div>
  );

  return (
    <>
      <header className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,540px)_auto] xl:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
            aria-label="Go back"
          >
            <AppIcon name="ArrowLeft" className="h-4 w-4" />
          </button>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 lg:hidden">{PRODUCT_NAME}</div>
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">{title}</h1>
          </div>
        </div>

        {showSearch ? (
          <form action={searchAction} className="relative min-w-0 xl:justify-self-center xl:w-full xl:max-w-[520px]">
            <AppIcon name="Search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="query"
              defaultValue={searchValue ?? ''}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-14 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-blue-100"
              placeholder="Search material, batch, location..."
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-400">
              ⌘ K
            </span>
          </form>
        ) : <div className="hidden xl:block" />}

        {actionButtons}
      </header>

      {showSearch ? (
        <form action={searchAction} className="relative mb-4 xl:hidden">
          <AppIcon name="Search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="query"
            defaultValue={searchValue ?? ''}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-14 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-blue-100"
            placeholder="Search material, batch, location..."
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-400">
            ⌘ K
          </span>
        </form>
      ) : null}

      <div className="mb-4 flex items-center justify-end gap-5 text-sm text-slate-500">
        <div>{timestamp}</div>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex items-center gap-2 font-medium text-[#2F6EF2]"
        >
          <AppIcon name="RefreshCcw" className="h-4 w-4" />
          Refresh
        </button>
      </div>
    </>
  );
}
