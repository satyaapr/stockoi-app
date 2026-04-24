'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { bottomSidebarItems, PRODUCT_NAME, sidebarSections } from '@/lib/navigation';
import { AppIcon } from '@/components/ui/icon';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-white/10 bg-[#0D1B4C] text-white lg:flex">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/8">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-[#2F6EF2] shadow-[0_10px_24px_rgba(47,110,242,0.45)]">
            <span className="text-sm font-bold">S</span>
          </div>
        </div>
        <div className="text-[15px] font-semibold tracking-[0.04em]">{PRODUCT_NAME}</div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {sidebarSections.map((section) => (
          <div key={section.label || 'root'} className="mb-6">
            {section.label ? <div className="sidebar-label mb-3">{section.label}</div> : null}
            <nav className="space-y-1 px-3">
              {section.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active ? 'bg-[#2F6EF2] text-white shadow-[0_10px_20px_rgba(47,110,242,0.35)]' : 'text-white/85 hover:bg-white/7'
                    }`}
                  >
                    <AppIcon name={item.icon} className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-white/10 px-3 py-4">
        <nav className="space-y-1">
          {bottomSidebarItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/7'
                }`}
              >
                <AppIcon name={item.icon} className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
