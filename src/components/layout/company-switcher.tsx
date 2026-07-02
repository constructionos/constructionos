import Link from "next/link";
import { Building2 } from "lucide-react";
import type { CompanySummary } from "@/modules/companies/queries";

function companyHref(path: string, slug: string) {
  return `${path}?company=${encodeURIComponent(slug)}`;
}

export function CompanySwitcher({
  activeCompany,
  companies,
  currentPath,
}: {
  activeCompany: CompanySummary;
  companies: CompanySummary[];
  currentPath: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 aria-hidden="true" size={17} />
          </span>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Empresa activa</p>
            <p className="font-medium">{activeCompany.name}</p>
          </div>
        </div>
        {companies.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {companies.map((company) => (
              <Link
                className={
                  company.id === activeCompany.id
                    ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                    : "rounded-md border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                }
                href={companyHref(currentPath, company.slug)}
                key={company.id}
              >
                {company.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
