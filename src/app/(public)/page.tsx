import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, ClipboardList, LineChart, MessagesSquare } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const channels = ["Web", "WhatsApp", "Llamadas", "Email", "Publicidad"];

const productBlocks = [
  {
    description: "Reune oportunidades que llegan desde formularios, WhatsApp, llamadas, email y campanas.",
    icon: MessagesSquare,
    title: "Captacion multicanal",
  },
  {
    description: "Ordena cada oportunidad con contacto, origen, fase comercial, prioridad y contexto de obra.",
    icon: Building2,
    title: "CRM de obra",
  },
  {
    description: "Convierte cada lead en una tarea clara para que el seguimiento comercial no se pierda.",
    icon: ClipboardList,
    title: "Siguiente tarea y seguimiento",
  },
  {
    description: "Base preparada para separar empresas, usuarios y landings sin mezclar datos entre clientes.",
    icon: LineChart,
    title: "Preparado para multiempresa",
  },
];

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <Badge tone="green">SaaS comercial para construccion</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              ConstructionOS
            </h1>
            <p className="mt-5 text-xl leading-8 text-foreground">
              Sistema operativo comercial para empresas de obra, reformas y arquitectura.
            </p>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Centraliza oportunidades que llegan desde web, WhatsApp, llamadas, email y publicidad, y conviertelas
              en seguimiento comercial ordenado.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-[#0f4b39]"
                href="/login"
              >
                Entrar al panel
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-muted"
                href="/intake/demo"
              >
                Ver intake demo
                <ClipboardList aria-hidden="true" size={16} />
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {channels.map((item) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" key={item}>
                  <CheckCircle2 aria-hidden="true" className="text-emerald-700" size={17} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div aria-label="Vista previa del seguimiento comercial" className="rounded-xl border border-border bg-[#17231d] p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-white">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-md bg-emerald-500">
                  <Building2 aria-hidden="true" size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Panel comercial</p>
                  <p className="text-xs text-white/60">Pipeline multicanal</p>
                </div>
              </div>
              <LineChart aria-hidden="true" className="text-white/60" size={20} />
            </div>
            <div className="grid gap-3 py-4 sm:grid-cols-3">
              {[
                ["14", "Leads"],
                ["6", "Nuevos"],
                ["5", "Tareas"],
              ].map(([value, label]) => (
                <div className="rounded-lg bg-white/[0.06] p-3" key={label}>
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="text-xs text-white/60">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                ["WhatsApp", "Llamar para concretar visita"],
                ["Email", "Pedir fotos o medidas"],
                ["Ads", "Hacer seguimiento del presupuesto"],
              ].map(([source, task]) => (
                <div className="flex items-center justify-between gap-4 rounded-lg bg-white p-3 text-sm" key={source}>
                  <div>
                    <p className="font-medium text-foreground">{task}</p>
                    <p className="text-xs text-muted-foreground">Origen: {source}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Lead</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-white">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
            {productBlocks.map((block) => {
              const Icon = block.icon;

              return (
                <Card className="p-5" key={block.title}>
                  <Icon aria-hidden="true" className="text-primary" size={22} />
                  <h2 className="mt-4 font-semibold">{block.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{block.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-primary">Separacion producto / piloto</p>
            <h2 className="mt-3 text-3xl font-semibold">ConstructionOS no es la web final de una constructora.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Las webs, landings y canales comerciales de cada empresa viviran fuera del producto y enviaran sus
              oportunidades hacia ConstructionOS. El intake demo existe solo para validar el flujo de entrada.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
