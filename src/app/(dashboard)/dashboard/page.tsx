import Link from "next/link";
import { ArrowUpRight, ClipboardList, PhoneCall, Send, Trophy, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CompanySwitcher } from "@/components/layout/company-switcher";
import { getActiveCompany } from "@/modules/companies/queries";
import { LeadStatusBadge } from "@/modules/leads/components/lead-status-badge";
import { getLeads, getLeadStats } from "@/modules/leads/queries";
import { leadStatusLabels, type LeadStatus } from "@/modules/leads/types";

type DashboardPageProps = {
  searchParams: Promise<{ company?: string | string[] }>;
};

function companyHref(path: string, slug: string) {
  return `${path}?company=${encodeURIComponent(slug)}`;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
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
  const [stats, leads] = await Promise.all([getLeadStats(activeCompany.id), getLeads(activeCompany.id)]);
  const recentLeads = leads.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="green">CRM inicial</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Panel comercial</h1>
          <p className="mt-2 text-muted-foreground">Pulso comercial de oportunidades activas.</p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"
          href={companyHref("/leads/new", activeCompany.slug)}
        >
          Crear oportunidad manual
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>

      <CompanySwitcher activeCompany={activeCompany} companies={companies} currentPath="/dashboard" />

      <section className="grid gap-4 md:grid-cols-5">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Oportunidades</span>
            <Users aria-hidden="true" className="text-primary" size={18} />
          </div>
          <p className="mt-4 text-3xl font-semibold">{stats.totalLeads}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nuevas</span>
            <TrendingUp aria-hidden="true" className="text-primary" size={18} />
          </div>
          <p className="mt-4 text-3xl font-semibold">{stats.newLeads}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Llamada o visita</span>
            <PhoneCall aria-hidden="true" className="text-primary" size={18} />
          </div>
          <p className="mt-4 text-3xl font-semibold">{stats.pendingFollowUp}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Presupuestos</span>
            <Send aria-hidden="true" className="text-primary" size={18} />
          </div>
          <p className="mt-4 text-3xl font-semibold">{stats.budgetSent}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ganados</span>
            <Trophy aria-hidden="true" className="text-primary" size={18} />
          </div>
          <p className="mt-4 text-3xl font-semibold">{stats.wonLeads}</p>
        </Card>
      </section>

      {!leads.length ? (
        <Card className="p-5">
          <h2 className="font-semibold">Siguiente paso recomendado</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Crea una oportunidad manual o comparte el formulario público de esta empresa.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Oportunidades recientes</h2>
            <ClipboardList aria-hidden="true" className="text-muted-foreground" size={18} />
          </div>
          {recentLeads.length ? (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <Link
                  className="flex items-center justify-between rounded-md border border-border p-3 transition hover:bg-muted/70"
                  href={companyHref(`/leads/${lead.id}`, activeCompany.slug)}
                  key={lead.id}
                >
                  <div>
                    <p className="font-medium">{lead.title}</p>
                    <p className="text-sm text-muted-foreground">{lead.next_action}</p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border p-4">
              <h3 className="font-medium">Aun no hay oportunidades en esta empresa</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Cuando entre una solicitud desde la web, WhatsApp, llamada o formulario interno, aparecera aqui para que puedas hacer seguimiento.
              </p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Estado del pipeline</h2>
          <div className="mt-5 space-y-4">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const leadStatus = status as LeadStatus;

              return (
                <div className="space-y-2" key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{leadStatusLabels[leadStatus]}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: stats.totalLeads ? `${Math.max((count / stats.totalLeads) * 100, 6)}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
