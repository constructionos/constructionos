import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LeadTable } from "@/modules/leads/components/lead-table";
import { getLeads } from "@/modules/leads/queries";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="blue">Oportunidades</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">Leads</h1>
          <p className="mt-2 text-muted-foreground">Seguimiento inicial de oportunidades comerciales.</p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium transition hover:bg-muted"
          href="/leads/new"
        >
          <Plus aria-hidden="true" size={16} />
          Nuevo lead
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <ClipboardList aria-hidden="true" className="text-primary" size={18} />
          <p className="mt-3 text-2xl font-semibold">{leads.length}</p>
          <p className="text-sm text-muted-foreground">Leads totales</p>
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

      <LeadTable leads={leads} />
    </div>
  );
}
