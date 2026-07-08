"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyLeadQuickAction, type LeadQuickActionState } from "../actions";
import {
  getLeadQuickActions,
  getSuggestedQuickActionDate,
  quickActionGroupLabels,
  type LeadQuickActionDefinition,
  type LeadQuickActionGroup,
} from "../quick-actions";
import { type Lead } from "../types";

const initialState: LeadQuickActionState = {
  ok: false,
};

const groupOrder: LeadQuickActionGroup[] = ["contact", "visit", "budget", "closing"];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full justify-center" disabled={pending} type="submit" variant="secondary">
      {pending ? "Aplicando" : label}
    </Button>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return <p className="text-xs text-red-700">{messages[0]}</p>;
}

export function LeadQuickActions({ activeCompanySlug, lead }: { activeCompanySlug: string; lead: Lead }) {
  const [state, formAction] = useActionState(applyLeadQuickAction, initialState);
  const actions = getLeadQuickActions(lead);

  if (!actions.length) {
    return (
      <div className="rounded-md border border-border bg-muted/60 p-4">
        <p className="text-sm font-medium">Esta oportunidad está cerrada.</p>
        <p className="mt-1 text-sm text-muted-foreground">No hay acciones comerciales pendientes para este lead.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state.message ? (
        <p className={state.ok ? "rounded-md bg-emerald-50 p-3 text-sm text-emerald-800" : "rounded-md bg-red-50 p-3 text-sm text-red-700"}>
          {state.message}
        </p>
      ) : null}
      {groupOrder.map((group) => {
        const groupActions = actions.filter((action) => action.group === group);

        if (!groupActions.length) {
          return null;
        }

        return (
          <div className="space-y-2" key={group}>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{quickActionGroupLabels[group]}</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {groupActions.map((action) => (
                <QuickActionForm
                  action={action}
                  activeCompanySlug={activeCompanySlug}
                  formAction={formAction}
                  key={action.id}
                  leadId={lead.id}
                  state={state}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuickActionForm({
  action,
  activeCompanySlug,
  formAction,
  leadId,
  state,
}: {
  action: LeadQuickActionDefinition;
  activeCompanySlug: string;
  formAction: (payload: FormData) => void;
  leadId: string;
  state: LeadQuickActionState;
}) {
  const suggestedDate = getSuggestedQuickActionDate(action);

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-border p-3">
      <input name="action_id" type="hidden" value={action.id} />
      <input name="company_slug" type="hidden" value={activeCompanySlug} />
      <input name="id" type="hidden" value={leadId} />
      {action.dateLabel ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`${action.id}-date`}>
            {action.dateLabel}
          </label>
          <Input
            defaultValue={suggestedDate}
            id={`${action.id}-date`}
            name="action_date"
            required={action.requiresDate}
            type="date"
          />
          <FieldError messages={state.fieldErrors?.action_date} />
        </div>
      ) : null}
      <SubmitButton label={action.label} />
    </form>
  );
}
