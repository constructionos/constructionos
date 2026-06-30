import Link from "next/link";
import { Building2 } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2 font-semibold tracking-tight" href="/">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 aria-hidden="true" size={18} />
          </span>
          ConstructionOS
        </Link>
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link className="rounded-md px-3 py-2 transition hover:bg-muted hover:text-foreground" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-md px-3 py-2 transition hover:bg-muted hover:text-foreground" href="/leads">
            Leads
          </Link>
        </nav>
      </div>
    </header>
  );
}
