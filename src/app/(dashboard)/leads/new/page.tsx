import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { getActiveCompany } from "@/modules/companies/queries";
import { ManualLeadForm } from "@/modules/leads/components/manual-lead-form";

type NewLeadPageProps = {
  searchParams: Promise<{ company?: string | string[] }>;
};

function companyHref(path: string, slug: string) {
  return `${path}?company=${encodeURIComponent(slug)}`;
}

export default async function NewLeadPage({ searchParams }: NewLeadPageProps) {
  const { company } = await searchParams;
  const companyContext = await getActiveCompany(company);

  if (!companyContext) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold">Empresa no disponible</h1>
          <p className="mt-3 text-muted-foreground">No tienes acceso a esta empresa o tu usuario no tiene membership.</p>
        </Card>
      </div>
    );
  }

  const { activeCompany, companies } = companyContext;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href={companyHref("/leads", activeCompany.slug)}>
        <ArrowLeft aria-hidden="true" size={16} />
        Volver a leads
      </Link>

      <CompanySwitcher activeCompany={activeCompany} companies={companies} currentPath="/leads/new" />

      <div>
        <Badge tone="green">Entrada manual</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Nuevo lead</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Registra una oportunidad que ha entrado por WhatsApp, llamada, referido o campana.
        </p>
      </div>

      <ManualLeadForm activeCompanySlug={activeCompany.slug} />
    </div>
  );
}
