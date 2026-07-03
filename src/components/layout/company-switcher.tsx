import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
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
  const otherCompanies = companies.filter((company) => company.id !== activeCompany.id);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 aria-hidden="true" size={17} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Empresa activa</p>
            <p className="font-medium">{activeCompany.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">Estás trabajando dentro del espacio de esta empresa.</p>
          </div>
        </div>
        {otherCompanies.length ? (
          <div className="flex flex-wrap gap-2">
            {otherCompanies.map((company) => (
              <Link
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-muted"
                href={companyHref(currentPath, company.slug)}
                key={company.id}
              >
                {company.name}
                <ArrowRight aria-hidden="true" size={14} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Solo tienes una empresa asociada.</p>
        )}
      </div>
    </div>
  );
}
