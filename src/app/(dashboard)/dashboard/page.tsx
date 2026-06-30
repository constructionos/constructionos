import Link from "next/link";
import { ArrowUpRight, ClipboardList, Euro, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import { LeadStatusBadge } from "@/modules/leads/components/lead-status-badge";
import { getLeads, getLeadStats } from "@/modules/leads/queries";
import { leadStatusLabels, type LeadStatus } from "@/modules/leads/types";

export default async function DashboardPage() {
  const [stats, leads] = await Promise.all([getLeadStats(), getLeads()]);
  const recentLeads = leads.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="green">CRM inicial</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Pulso comercial de oportunidades activas.</p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"
          href="/leads"
        >
          Ver leads
          <ArrowUpRight aria-hidden="true" size={16} />
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Leads abiertos</span>
            <Users aria-hidden="true" className="text-primary" size={18} />
          </div>
          <p className="mt-4 text-3xl font-semibold">{stats.openLeads}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor pipeline</span>
            <Euro aria-hidden="true" className="text-primary" size={18} />
          </div>
          <p className="mt-4 text-3xl font-semibold">{formatCurrency(stats.pipelineValue)}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Presupuestos enviados</span>
            <TrendingUp aria-hidden="true" className="text-primary" size={18} />
          </div>
          <p className="mt-4 text-3xl font-semibold">{stats.budgetSent}</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Oportunidades recientes</h2>
            <ClipboardList aria-hidden="true" className="text-muted-foreground" size={18} />
          </div>
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <Link
                className="flex items-center justify-between rounded-md border border-border p-3 transition hover:bg-muted/70"
                href={`/leads/${lead.id}`}
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
                      style={{ width: `${Math.max((count / stats.totalLeads) * 100, 6)}%` }}
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
