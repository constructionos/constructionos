import { isClosedLead } from "./presentation";
import type { Lead, LeadStatus } from "./types";

export const leadQuickActionIds = [
  "schedule_call",
  "schedule_visit",
  "mark_visit_done",
  "prepare_budget",
  "mark_budget_sent",
  "schedule_follow_up",
  "start_negotiation",
  "mark_won",
  "mark_lost",
  "discard",
] as const;

export type LeadQuickActionId = (typeof leadQuickActionIds)[number];

export type LeadQuickActionGroup = "budget" | "closing" | "contact" | "visit";

export type LeadQuickActionDefinition = {
  dateLabel?: string;
  defaultOffsetDays?: number;
  group: LeadQuickActionGroup;
  id: LeadQuickActionId;
  label: string;
  requiresDate: boolean;
};

export type LeadQuickActionPatch = {
  next_action: string;
  next_action_date: string | null;
  status: LeadStatus;
};

const availableActionsByStatus: Record<LeadStatus, LeadQuickActionId[]> = {
  budget_preparing: ["mark_budget_sent", "schedule_follow_up", "discard"],
  budget_sent: ["schedule_follow_up", "start_negotiation", "mark_won", "mark_lost", "discard"],
  discarded: [],
  lost: [],
  negotiation: ["schedule_follow_up", "mark_won", "mark_lost", "discard"],
  new: ["schedule_call", "schedule_visit", "schedule_follow_up", "discard"],
  pending_call: ["schedule_call", "schedule_visit", "schedule_follow_up", "discard"],
  visit_done: ["prepare_budget", "schedule_follow_up", "discard"],
  visit_pending: ["mark_visit_done", "schedule_visit", "schedule_follow_up", "discard"],
  won: [],
};

export const quickActionGroupLabels: Record<LeadQuickActionGroup, string> = {
  budget: "Presupuesto",
  closing: "Cierre",
  contact: "Próximo contacto",
  visit: "Visita",
};

export const leadQuickActionDefinitions: Record<LeadQuickActionId, LeadQuickActionDefinition> = {
  discard: {
    group: "closing",
    id: "discard",
    label: "Descartar",
    requiresDate: false,
  },
  mark_budget_sent: {
    dateLabel: "Seguimiento",
    defaultOffsetDays: 3,
    group: "budget",
    id: "mark_budget_sent",
    label: "Marcar presupuesto enviado",
    requiresDate: true,
  },
  mark_lost: {
    group: "closing",
    id: "mark_lost",
    label: "Marcar perdida",
    requiresDate: false,
  },
  mark_visit_done: {
    dateLabel: "Presupuesto",
    defaultOffsetDays: 1,
    group: "visit",
    id: "mark_visit_done",
    label: "Marcar visita realizada",
    requiresDate: false,
  },
  mark_won: {
    group: "closing",
    id: "mark_won",
    label: "Marcar ganada",
    requiresDate: false,
  },
  prepare_budget: {
    dateLabel: "Fecha objetivo",
    group: "budget",
    id: "prepare_budget",
    label: "Preparar presupuesto",
    requiresDate: false,
  },
  schedule_call: {
    dateLabel: "Fecha de llamada",
    group: "contact",
    id: "schedule_call",
    label: "Programar llamada",
    requiresDate: true,
  },
  schedule_follow_up: {
    dateLabel: "Fecha de seguimiento",
    group: "contact",
    id: "schedule_follow_up",
    label: "Programar seguimiento",
    requiresDate: true,
  },
  schedule_visit: {
    dateLabel: "Fecha de visita",
    group: "visit",
    id: "schedule_visit",
    label: "Programar visita",
    requiresDate: true,
  },
  start_negotiation: {
    dateLabel: "Fecha objetivo",
    group: "closing",
    id: "start_negotiation",
    label: "Pasar a negociación",
    requiresDate: false,
  },
};

export function getLeadQuickActions(lead: Pick<Lead, "status">) {
  if (isClosedLead(lead)) {
    return [];
  }

  return availableActionsByStatus[lead.status].map((actionId) => leadQuickActionDefinitions[actionId]);
}

export function getQuickActionPatch(
  actionId: LeadQuickActionId,
  lead: Pick<Lead, "status">,
  actionDate?: string,
): LeadQuickActionPatch | null {
  const action = leadQuickActionDefinitions[actionId];

  if (!getLeadQuickActions(lead).some((availableAction) => availableAction.id === actionId)) {
    return null;
  }

  if (action.requiresDate && !actionDate) {
    return null;
  }

  const fallbackDate = actionDate || getOptionalSuggestedDate(action);

  switch (actionId) {
    case "discard":
      return closeLead("discarded");
    case "mark_budget_sent":
      return {
        next_action: "Hacer seguimiento del presupuesto",
        next_action_date: fallbackDate,
        status: "budget_sent",
      };
    case "mark_lost":
      return closeLead("lost");
    case "mark_visit_done":
      return {
        next_action: "Preparar presupuesto",
        next_action_date: fallbackDate,
        status: "visit_done",
      };
    case "mark_won":
      return closeLead("won");
    case "prepare_budget":
      return {
        next_action: "Enviar presupuesto",
        next_action_date: fallbackDate,
        status: "budget_preparing",
      };
    case "schedule_call":
      return {
        next_action: "Llamar al cliente",
        next_action_date: actionDate ?? null,
        status: "pending_call",
      };
    case "schedule_follow_up":
      return {
        next_action: "Hacer seguimiento",
        next_action_date: actionDate ?? null,
        status: lead.status === "new" ? "pending_call" : lead.status,
      };
    case "schedule_visit":
      return {
        next_action: "Realizar visita",
        next_action_date: actionDate ?? null,
        status: "visit_pending",
      };
    case "start_negotiation":
      return {
        next_action: "Cerrar acuerdo",
        next_action_date: fallbackDate,
        status: "negotiation",
      };
  }
}

export function getSuggestedQuickActionDate(action: LeadQuickActionDefinition, now = new Date()) {
  return getDateOffset(now, action.defaultOffsetDays ?? 0);
}

function closeLead(status: "discarded" | "lost" | "won"): LeadQuickActionPatch {
  return {
    next_action: "",
    next_action_date: null,
    status,
  };
}

function getOptionalSuggestedDate(action: LeadQuickActionDefinition) {
  return action.defaultOffsetDays === undefined ? null : getSuggestedQuickActionDate(action);
}

function getDateOffset(now: Date, offsetDays: number) {
  const date = new Date(now);
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
