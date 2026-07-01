import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, Mail, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { LeadStatusBadge } from "@/modules/leads/components/lead-status-badge";
import { LeadWorkflowForm } from "@/modules/leads/components/lead-workflow-form";
import { getLeadById } from "@/modules/leads/queries";
import {
  budgetRangeLabels,
  desiredTimelineLabels,
  leadPriorityLabels,
  leadServiceTypeLabels,
  leadSourceLabels,
} from "@/modules/leads/types";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/leads">
        <ArrowLeft aria-hidden="true" size={16} />
        Volver a leads
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge tone={lead.priority === "high" ? "amber" : "neutral"}>{leadPriorityLabels[lead.priority]} prioridad</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">{lead.title}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{lead.contact_name} quiere avanzar una oportunidad en {lead.city}.</p>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Resumen del lead</h2>
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Valor estimado</p>
            <p className="mt-3 text-2xl font-semibold">{formatCurrency(lead.estimated_budget)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Rango</p>
            <p className="mt-3 text-2xl font-semibold">{budgetRangeLabels[lead.budget_range]}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Creado</p>
            <p className="mt-3 text-2xl font-semibold">{formatDate(lead.created_at)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Prioridad</p>
            <p className="mt-3 text-2xl font-semibold">{leadPriorityLabels[lead.priority]}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Origen</p>
            <p className="mt-3 text-2xl font-semibold">{leadSourceLabels[lead.source]}</p>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="font-semibold">Datos del contacto</h2>
          <div className="mt-4 space-y-3 text-sm">
            <p className="font-medium">{lead.contact_name}</p>
            <p className="flex items-center gap-3">
              <Mail aria-hidden="true" className="text-primary" size={17} />
              {lead.email || "Sin email"}
            </p>
            <p className="flex items-center gap-3">
              <Phone aria-hidden="true" className="text-primary" size={17} />
              {lead.phone}
            </p>
            <p className="flex items-center gap-3">
              <MapPin aria-hidden="true" className="text-primary" size={17} />
              {lead.zone}, {lead.city}, {lead.province}
            </p>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Necesidad declarada</h2>
          <div className="mt-4 flex items-start gap-3 rounded-md bg-muted p-4">
            <FileText aria-hidden="true" className="mt-0.5 text-primary" size={18} />
            <p className="text-sm leading-6">{lead.description}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">Servicio</p>
              <p className="mt-1 text-sm font-medium">{leadServiceTypeLabels[lead.service_type]}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">Plazo deseado</p>
              <p className="mt-1 text-sm font-medium">{desiredTimelineLabels[lead.desired_timeline]}</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="font-semibold">Gestion de oportunidad</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Actualiza el estado comercial, prioridad y siguiente paso sin cambiar los datos captados del cliente.
          </p>
          <div className="mt-5">
            <LeadWorkflowForm lead={lead} />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Proxima accion</h2>
          <div className="mt-4 flex items-start gap-3 rounded-md bg-muted p-4">
            <CalendarDays aria-hidden="true" className="mt-0.5 text-primary" size={18} />
            <div>
              <p className="font-medium">{lead.next_action}</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatDate(lead.next_action_date)}</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
