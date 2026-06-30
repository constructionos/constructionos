"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createLeadAction, type LeadActionState } from "../actions";

const initialState: LeadActionState = {
  ok: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      <Send aria-hidden="true" size={16} />
      {pending ? "Enviando" : "Solicitar demo"}
    </Button>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return <p className="text-xs text-red-700">{messages[0]}</p>;
}

export function LeadCaptureForm() {
  const [state, formAction] = useActionState(createLeadAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Captacion de oportunidades</h2>
        <p className="mt-1 text-sm text-muted-foreground">Centraliza nuevas obras desde el primer contacto.</p>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="title">
          Oportunidad de obra
        </label>
        <Input id="title" name="title" placeholder="Reforma integral, obra nueva..." />
        <FieldError messages={state.fieldErrors?.title} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="contact_name">
          Contacto
        </label>
        <Input id="contact_name" name="contact_name" placeholder="Persona responsable" />
        <FieldError messages={state.fieldErrors?.contact_name} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" placeholder="contacto@empresa.com" type="email" />
        <FieldError messages={state.fieldErrors?.email} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="city">
          Ciudad
        </label>
        <Input id="city" name="city" placeholder="Madrid" />
        <FieldError messages={state.fieldErrors?.city} />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="service_type">
          Tipo de servicio
        </label>
        <Select defaultValue="renovation" id="service_type" name="service_type">
          <option value="renovation">Reforma</option>
          <option value="new_build">Obra nueva</option>
          <option value="technical_direction">Direccion tecnica</option>
          <option value="site_coordination">Coordinacion de obra</option>
          <option value="other">Otro servicio</option>
        </Select>
        <FieldError messages={state.fieldErrors?.service_type} />
      </div>
      <SubmitButton />
      {state.message ? (
        <p className={state.ok ? "text-sm text-emerald-700" : "text-sm text-red-700"}>{state.message}</p>
      ) : null}
    </form>
  );
}
