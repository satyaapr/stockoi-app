import type { ReactNode } from 'react';
import { getLayoutContext } from '@/lib/data';
import { Sidebar } from '@/components/app/sidebar';
import { Topbar } from '@/components/app/topbar';
import { AutoRefresh } from '@/components/app/auto-refresh';

type AppShellProps = {
  title: string;
  searchAction?: string;
  searchValue?: string;
  showSearch?: boolean;
  autoRefreshMs?: number;
  children: ReactNode;
};

export async function AppShell({
  title,
  searchAction,
  searchValue,
  showSearch = false,
  autoRefreshMs,
  children,
}: AppShellProps) {
  const context = await getLayoutContext();

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <Sidebar />
      <main className="min-w-0 px-4 py-4 sm:px-6 lg:pl-[260px] lg:pr-6 lg:py-4 xl:pr-7">
        {autoRefreshMs ? <AutoRefresh intervalMs={autoRefreshMs} /> : null}
        <Topbar
          title={title}
          searchAction={searchAction}
          searchValue={searchValue}
          showSearch={showSearch}
          timestamp={context.timestampLabel}
          notifications={context.notifications}
          notificationItems={context.notificationItems}
          helpLinks={context.helpLinks}
          userName={context.userName}
          userRole={context.userRole}
        />
        <div>{children}</div>
      </main>
    </div>
  );
}
