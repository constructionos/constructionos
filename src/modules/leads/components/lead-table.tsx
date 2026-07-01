import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import { LeadStatusBadge } from "./lead-status-badge";
import { leadPriorityLabels, leadServiceTypeLabels, leadSourceLabels, type Lead } from "../types";

const priorityTones: Record<Lead["priority"], "neutral" | "amber" | "blue"> = {
  high: "amber",
  low: "neutral",
  medium: "blue",
};

const sourceTones: Record<Lead["source"], "neutral" | "green" | "amber" | "blue"> = {
  ads: "amber",
  manual: "neutral",
  phone: "green",
  referral: "green",
  web: "blue",
  whatsapp: "green",
};

export function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div className="min-w-[1220px]">
        <div className="grid grid-cols-[1.2fr_1fr_0.9fr_0.75fr_0.8fr_1.2fr_1fr_0.8fr_44px] border-b border-border bg-muted/70 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
          <span>Oportunidad</span>
          <span>Contacto</span>
          <span>Estado</span>
          <span>Origen</span>
          <span>Prioridad</span>
          <span>Proxima accion</span>
          <span>Tipo y ciudad</span>
          <span>Creado</span>
          <span />
        </div>
        {!leads.length ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Todavia no hay leads reales para esta empresa.
          </div>
        ) : null}
        {leads.map((lead) => (
          <div
            className="grid grid-cols-[1.2fr_1fr_0.9fr_0.75fr_0.8fr_1.2fr_1fr_0.8fr_44px] items-center border-b border-border px-4 py-4 text-sm last:border-0"
            key={lead.id}
          >
            <div>
              <p className="font-medium">{lead.title}</p>
              <p className="text-muted-foreground">
                {lead.zone}, {lead.city}
              </p>
            </div>
            <div>
              <p>{lead.contact_name}</p>
              <p className="text-muted-foreground">{lead.email}</p>
            </div>
            <LeadStatusBadge status={lead.status} />
            <Badge tone={sourceTones[lead.source]}>{leadSourceLabels[lead.source]}</Badge>
            <Badge tone={priorityTones[lead.priority]}>{leadPriorityLabels[lead.priority]}</Badge>
            <div>
              <p>{lead.next_action}</p>
              <p className="text-muted-foreground">{formatDate(lead.next_action_date)}</p>
            </div>
            <div>
              <p>{leadServiceTypeLabels[lead.service_type]}</p>
              <p className="text-muted-foreground">{lead.city}</p>
            </div>
            <span className="text-muted-foreground">{formatDate(lead.created_at)}</span>
            <Link
              aria-label={`Abrir ${lead.title}`}
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
              href={`/leads/${lead.id}`}
            >
              <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
