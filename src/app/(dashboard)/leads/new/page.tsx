import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ManualLeadForm } from "@/modules/leads/components/manual-lead-form";

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/leads">
        <ArrowLeft aria-hidden="true" size={16} />
        Volver a leads
      </Link>

      <div>
        <Badge tone="green">Entrada manual</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Nuevo lead</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Registra una oportunidad que ha entrado por WhatsApp, llamada, referido o campana.
        </p>
      </div>

      <ManualLeadForm />
    </div>
  );
}
