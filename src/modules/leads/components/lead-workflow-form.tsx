"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  leadPriorities,
  leadPriorityLabels,
  leadStatusLabels,
  leadStatuses,
  type Lead,
} from "../types";
import { updateLeadWorkflowAction, type LeadWorkflowActionState } from "../actions";

const initialState: LeadWorkflowActionState = {
  ok: false,
};

function dateInputValue(value: string) {
  return value.slice(0, 10);
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return <p className="text-xs text-red-700">{messages[0]}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-fit" disabled={pending} type="submit">
      <Save aria-hidden="true" size={16} />
      {pending ? "Guardando" : "Guardar cambios"}
    </Button>
  );
}

export function LeadWorkflowForm({ lead }: { lead: Lead }) {
  const [state, formAction] = useActionState(updateLeadWorkflowAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input name="id" type="hidden" value={lead.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="status">
            Fase comercial
          </label>
          <p className="text-xs text-muted-foreground">En que fase esta el lead.</p>
          <Select defaultValue={lead.status} id="status" name="status">
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {leadStatusLabels[status]}
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.status} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="priority">
            Prioridad
          </label>
          <Select defaultValue={lead.priority} id="priority" name="priority">
            {leadPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {leadPriorityLabels[priority]}
              </option>
            ))}
          </Select>
          <FieldError messages={state.fieldErrors?.priority} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="next_action">
            Siguiente tarea
          </label>
          <p className="text-xs text-muted-foreground">Que hay que hacer ahora con este lead.</p>
          <Input
            id="next_action"
            maxLength={180}
            name="next_action"
            required
            defaultValue={lead.next_action}
            placeholder="Llamar para concretar visita"
          />
          <p className="text-xs text-muted-foreground">
            Ejemplos: pedir fotos o medidas, preparar presupuesto, hacer seguimiento del presupuesto.
          </p>
          <FieldError messages={state.fieldErrors?.next_action} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="next_action_date">
            Fecha
          </label>
          <Input
            id="next_action_date"
            name="next_action_date"
            required
            type="date"
            defaultValue={dateInputValue(lead.next_action_date)}
          />
          <FieldError messages={state.fieldErrors?.next_action_date} />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton />
        {state.message ? (
          <p className={state.ok ? "text-sm text-emerald-700" : "text-sm text-red-700"}>{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
