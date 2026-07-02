"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  budgetRangeLabels,
  desiredTimelineLabels,
  leadPriorities,
  leadPriorityLabels,
  leadServiceTypeLabels,
  leadServiceTypes,
  leadSourceLabels,
  type LeadSource,
} from "../types";
import { createManualLeadAction, type ManualLeadActionState } from "../actions";

const initialState: ManualLeadActionState = {
  ok: false,
};

const orderedSources: LeadSource[] = ["whatsapp", "phone", "email", "manual", "referral", "ads", "web"];

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return <p className="text-xs text-red-700">{messages[0]}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      <Plus aria-hidden="true" size={16} />
      {pending ? "Creando" : "Crear lead"}
    </Button>
  );
}

export function ManualLeadForm() {
  const [state, formAction] = useActionState(createManualLeadAction, initialState);

  return (
    <form action={formAction} className="space-y-6 rounded-lg border border-border bg-card p-5 shadow-sm">
      <section className="grid gap-4 md:grid-cols-[0.8fr_1fr]">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="source">
            Origen
          </label>
          <Select defaultValue="whatsapp" id="source" name="source">
            {orderedSources.map((source) => (
              <option key={source} value={source}>
                {leadSourceLabels[source]}
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.source} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="title">
            Titulo / oportunidad
          </label>
          <Input id="title" maxLength={200} name="title" placeholder="Reforma vivienda, llamada local comercial..." />
          <FieldError messages={state.fieldErrors?.title} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="contact_name">
            Nombre del contacto
          </label>
          <Input id="contact_name" maxLength={160} name="contact_name" placeholder="Nombre o empresa" />
          <FieldError messages={state.fieldErrors?.contact_name} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="phone">
            Telefono
          </label>
          <Input id="phone" maxLength={40} name="phone" placeholder="+34 600 000 000" type="tel" />
          <FieldError messages={state.fieldErrors?.phone} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="email">
            Email opcional
          </label>
          <Input id="email" name="email" placeholder="contacto@empresa.com" type="email" />
          <FieldError messages={state.fieldErrors?.email} />
        </div>
      </section>

      <section className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="description">
          Pega aqui el mensaje recibido o resume la conversacion.
        </label>
        <textarea
          className="min-h-28 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          id="description"
          maxLength={2000}
          name="description"
          placeholder="Mensaje de WhatsApp, resumen de llamada, referido o briefing de campana."
        />
        <FieldError messages={state.fieldErrors?.description} />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="service_type">
            Tipo de obra
          </label>
          <Select defaultValue="renovation" id="service_type" name="service_type">
            {leadServiceTypes.map((serviceType) => (
              <option key={serviceType} value={serviceType}>
                {leadServiceTypeLabels[serviceType]}
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.service_type} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="city">
            Ciudad
          </label>
          <Input id="city" maxLength={120} name="city" placeholder="Madrid" />
          <FieldError messages={state.fieldErrors?.city} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="province">
            Provincia opcional
          </label>
          <Input id="province" maxLength={120} name="province" placeholder="Por definir" />
          <FieldError messages={state.fieldErrors?.province} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="priority">
            Prioridad
          </label>
          <Select defaultValue="medium" id="priority" name="priority">
            {leadPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {leadPriorityLabels[priority]}
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.priority} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="budget_range">
            Rango de presupuesto
          </label>
          <Select defaultValue="unknown" id="budget_range" name="budget_range">
            {Object.entries(budgetRangeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.budget_range} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="desired_timeline">
            Plazo deseado
          </label>
          <Select defaultValue="unknown" id="desired_timeline" name="desired_timeline">
            {Object.entries(desiredTimelineLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.desired_timeline} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_180px]">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="next_action">
            Siguiente tarea opcional
          </label>
          <p className="text-xs text-muted-foreground">Que hay que hacer ahora con este lead.</p>
          <Input
            id="next_action"
            maxLength={180}
            name="next_action"
            placeholder="Llamar para concretar visita"
          />
          <p className="text-xs text-muted-foreground">
            Ejemplos: pedir fotos o medidas, preparar presupuesto, hacer seguimiento del presupuesto.
          </p>
          <FieldError messages={state.fieldErrors?.next_action} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="next_action_date">
            Fecha opcional
          </label>
          <Input id="next_action_date" name="next_action_date" type="date" />
          <FieldError messages={state.fieldErrors?.next_action_date} />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton />
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium transition hover:bg-muted"
          href="/leads"
        >
          Cancelar
        </Link>
        {state.message ? <p className="text-sm text-red-700">{state.message}</p> : null}
      </div>
    </form>
  );
}
