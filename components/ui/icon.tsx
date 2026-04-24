import type { SVGProps } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  FileX2,
  GitBranch,
  History,
  Home,
  ImageUp,
  Layers3,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPinOff,
  MapPinned,
  Package,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';

const ICONS = {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  FileX2,
  GitBranch,
  History,
  Home,
  ImageUp,
  Layers3,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPinOff,
  MapPinned,
  Package,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Users,
};

export type AppIconName = keyof typeof ICONS;

type IconProps = SVGProps<SVGSVGElement> & {
  name: AppIconName | string;
};

export function AppIcon({ name, ...props }: IconProps) {
  const Icon = (ICONS as Record<string, typeof Package>)[name] ?? Package;
  return <Icon {...props} />;
}
