import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { LeadStatusBadge } from "./lead-status-badge";
import type { Lead } from "../types";

export function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr_0.8fr_44px] border-b border-border bg-muted/70 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
          <span>Oportunidad</span>
          <span>Contacto</span>
          <span>Estado</span>
          <span>Valor estimado</span>
          <span>Proxima accion</span>
          <span />
        </div>
        {!leads.length ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Todavia no hay leads reales para esta empresa.
          </div>
        ) : null}
        {leads.map((lead) => (
          <div
            className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr_0.8fr_44px] items-center border-b border-border px-4 py-4 text-sm last:border-0"
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
            <span className="font-medium">{formatCurrency(lead.estimated_budget)}</span>
            <div>
              <p>{lead.next_action}</p>
              <p className="text-muted-foreground">{formatDate(lead.next_action_date)}</p>
            </div>
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
