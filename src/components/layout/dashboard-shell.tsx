import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Building2, ClipboardList, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: ClipboardList },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#25342d] bg-[#17231d] text-white lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <span className="flex size-9 items-center justify-center rounded-md bg-emerald-500 text-white">
            <Building2 aria-hidden="true" size={18} />
          </span>
          <span className="font-semibold tracking-tight">ConstructionOS</span>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navigation.map((item) => (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/74 transition hover:bg-white/10 hover:text-white",
              )}
              href={item.href}
              key={item.href}
            >
              <item.icon aria-hidden="true" size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 aria-hidden="true" size={16} />
            Demo CRM
          </div>
          <p className="mt-2 text-xs leading-5 text-white/62">Oportunidades, seguimiento y actividad comercial.</p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/88 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Link className="flex items-center gap-2 font-semibold lg:hidden" href="/">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Building2 aria-hidden="true" size={18} />
              </span>
              ConstructionOS
            </Link>
            <nav className="ml-auto flex items-center gap-2 text-sm text-muted-foreground lg:hidden">
              {navigation.map((item) => (
                <Link className="rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
