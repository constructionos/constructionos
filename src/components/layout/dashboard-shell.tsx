import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Building2, LogOut } from "lucide-react";
import { DashboardNavigation } from "@/components/layout/dashboard-navigation";
import { signOutAction } from "@/modules/auth/actions";

export function DashboardShell({ children, userEmail }: { children: ReactNode; userEmail?: string }) {
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
          <DashboardNavigation />
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 aria-hidden="true" size={16} />
            Oficina comercial
          </div>
          <p className="mt-2 text-xs leading-5 text-white/62">Oportunidades, tareas y seguimiento por empresa.</p>
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
              <DashboardNavigation variant="mobile" />
              <form action={signOutAction}>
                <button className="rounded-md px-3 py-2 hover:bg-muted hover:text-foreground" type="submit">
                  Salir
                </button>
              </form>
            </nav>
            <div className="ml-auto hidden items-center gap-3 lg:flex">
              {userEmail ? <span className="text-sm text-muted-foreground">{userEmail}</span> : null}
              <form action={signOutAction}>
                <button
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  type="submit"
                >
                  <LogOut aria-hidden="true" size={16} />
                  Salir
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
