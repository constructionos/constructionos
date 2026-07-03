import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { getActiveCompany } from "@/modules/companies/queries";
import { LeadTable } from "@/modules/leads/components/lead-table";
import { getLeads } from "@/modules/leads/queries";

type LeadsPageProps = {
  searchParams: Promise<{ company?: string | string[] }>;
};

function companyHref(path: string, slug: string) {
  return `${path}?company=${encodeURIComponent(slug)}`;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const { company } = await searchParams;
  const companyContext = await getActiveCompany(company);

  if (!companyContext) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold">No tienes acceso a esta empresa o no existe.</h1>
          <p className="mt-3 text-muted-foreground">No se mostraran datos hasta que selecciones una empresa asociada a tu usuario.</p>
          <Link
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium transition hover:bg-muted"
            href="/dashboard"
          >
            Volver a mi panel
          </Link>
        </Card>
      </div>
    );
  }

  const { activeCompany, companies } = companyContext;
  const leads = await getLeads(activeCompany.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="blue">Oportunidades</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Oportunidades</h1>
          <p className="mt-2 text-muted-foreground">Seguimiento inicial de oportunidades comerciales.</p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium transition hover:bg-muted"
          href={companyHref("/leads/new", activeCompany.slug)}
        >
          <Plus aria-hidden="true" size={16} />
          Nueva oportunidad
        </Link>
      </div>

      <CompanySwitcher activeCompany={activeCompany} companies={companies} currentPath="/leads" />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <ClipboardList aria-hidden="true" className="text-primary" size={18} />
          <p className="mt-3 text-2xl font-semibold">{leads.length}</p>
          <p className="text-sm text-muted-foreground">Oportunidades totales</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{leads.filter((lead) => lead.priority === "high").length}</p>
          <p className="text-sm text-muted-foreground">Alta prioridad</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-2xl font-semibold">{leads.filter((lead) => lead.status === "budget_sent").length}</p>
          <p className="text-sm text-muted-foreground">Presupuestos enviados</p>
        </div>
      </section>

      {leads.length ? (
        <LeadTable companySlug={activeCompany.slug} leads={leads} />
      ) : (
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Aun no hay oportunidades en esta empresa</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            Cuando entre una solicitud desde la web, WhatsApp, llamada o formulario interno, aparecera aqui para que puedas hacer seguimiento.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-[#0f4b39]"
              href={companyHref("/leads/new", activeCompany.slug)}
            >
              Crear oportunidad manual
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium transition hover:bg-muted"
              href={`/intake/${activeCompany.slug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              Abrir formulario público
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
