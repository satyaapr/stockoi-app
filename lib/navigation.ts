export const PRODUCT_NAME = 'STOCK.OI';

export const sidebarSections = [
  {
    label: '',
    items: [
      { title: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    ],
  },
  {
    label: 'Receiving',
    items: [
      { title: 'Receiving Automation', href: '/receiving/receiving-automation', icon: 'Search' },
      { title: 'Validation', href: '/receiving/validation', icon: 'ShieldCheck' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { title: 'Status Board', href: '/monitoring/status-board', icon: 'BarChart3' },
      { title: 'Alert & Anomaly', href: '/monitoring/alert-anomaly', icon: 'AlertTriangle' },
    ],
  },
  {
    label: 'Tracking',
    items: [
      { title: 'Movement Timeline', href: '/tracking/movement-timeline', icon: 'GitBranch' },
      { title: 'Audit Trail', href: '/tracking/audit-trail', icon: 'History' },
    ],
  },
  {
    label: 'Reporting',
    items: [
      { title: 'Validation Report', href: '/reporting/validation-report', icon: 'Printer' },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { title: 'Material Master', href: '/master/material-master', icon: 'Boxes' },
      { title: 'Location Master', href: '/master/location-master', icon: 'MapPinned' },
      { title: 'User Management', href: '/master/user-management', icon: 'Users' },
    ],
  },
] as const;

export const bottomSidebarItems = [
  { title: 'Logout', href: '/logout', icon: 'LogOut' },
] as const;
