import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, HardHat, LineChart } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LeadCaptureForm } from "@/modules/leads/components/lead-capture-form";

const pipeline = [
  { label: "Nuevo", value: "8", tone: "bg-sky-500" },
  { label: "Calificado", value: "5", tone: "bg-emerald-500" },
  { label: "Propuesta", value: "3", tone: "bg-amber-500" },
];

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <Badge tone="green">Demo inicial SaaS</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              ConstructionOS
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              CRM ligero para captar, ordenar y seguir oportunidades de obra antes de crecer hacia operaciones mas
              complejas.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-[#0f4b39]"
                href="#captacion"
              >
                Solicitar demo
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-muted"
                href="/dashboard"
              >
                Ver dashboard
                <LineChart aria-hidden="true" size={16} />
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {["Landing publica", "Leads", "Dashboard base"].map((item) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" key={item}>
                  <CheckCircle2 aria-hidden="true" className="text-emerald-700" size={17} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div aria-label="Vista previa del pipeline comercial" className="rounded-xl border border-border bg-[#17231d] p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-white">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-md bg-emerald-500">
                  <HardHat aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Pipeline</p>
                  <p className="text-xs text-white/60">Junio 2026</p>
                </div>
              </div>
              <ClipboardList aria-hidden="true" className="text-white/60" size={20} />
            </div>
            <div className="grid gap-3 py-4 sm:grid-cols-3">
              {pipeline.map((item) => (
                <div className="rounded-lg bg-white/[0.06] p-3" key={item.label}>
                  <div className={`mb-3 h-1.5 rounded-full ${item.tone}`} />
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="text-xs text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {["Reforma integral", "Local comercial", "Promocion residencial"].map((item, index) => (
                <div className="flex items-center justify-between rounded-lg bg-white p-3 text-sm" key={item}>
                  <div>
                    <p className="font-medium text-foreground">{item}</p>
                    <p className="text-xs text-muted-foreground">Siguiente accion en {index + 2} dias</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Lead</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-white" id="captacion">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-primary">Captacion</p>
              <h2 className="mt-3 text-3xl font-semibold">Primer flujo comercial listo para demo.</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                El formulario valida datos basicos y deja el punto de integracion preparado para persistencia en
                Supabase cuando se conecte el proyecto.
              </p>
            </div>
            <LeadCaptureForm />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3">
          {[
            ["Leads centralizados", "Oportunidades con estado, prioridad, valor y siguiente accion."],
            ["Dashboard base", "Resumen comercial para orientar seguimiento diario."],
            ["Supabase preparado", "Clientes lazy y migracion inicial sin claves reales."],
          ].map(([title, description]) => (
            <Card className="p-5" key={title}>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
