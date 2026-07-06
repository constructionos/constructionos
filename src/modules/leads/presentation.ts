import { formatCurrency, formatDate } from "@/lib/utils/format";
import { leadServiceTypeLabels, type Lead, type LeadStatus } from "./types";

const undefinedLocationValues = new Set(["", "por definir"]);
const followUpWarningDays = 7;

const activeLeadStatuses = new Set<LeadStatus>([
  "new",
  "pending_call",
  "visit_pending",
  "visit_done",
  "budget_preparing",
  "budget_sent",
  "negotiation",
]);
const closedLeadStatuses = new Set<LeadStatus>(["won", "lost", "discarded"]);
const budgetLeadStatuses = new Set<LeadStatus>(["budget_preparing", "budget_sent", "negotiation"]);
const contactActionPattern = /contactar|llamar/i;

const captureContextPatterns = {
  landingVersion: /^Landing version:\s*(.+)$/i,
  projectStatus: /^Estado del proyecto:\s*(.+)$/i,
  province: /^Provincia:\s*(.+)$/i,
  source: /^Origen landing:\s*(.+)$/i,
  submittedFrom: /^Submitted from:\s*(.+)$/i,
};

export type CaptureContextItem = {
  label: string;
  value: string;
};

export type LeadFollowUpSignal = "overdue" | "today" | "missing_next_action" | "stale";

export type LeadFollowUpStats = {
  missingNextAction: number;
  overdueFollowUps: number;
  staleLeads: number;
  todayFollowUps: number;
};

export const leadFollowUpSignalLabels: Record<LeadFollowUpSignal, string> = {
  missing_next_action: "Sin próxima acción",
  overdue: "Vencida",
  stale: "Parada",
  today: "Hoy",
};

export const leadFollowUpSignalTones: Record<LeadFollowUpSignal, "neutral" | "amber" | "blue" | "red"> = {
  missing_next_action: "neutral",
  overdue: "red",
  stale: "blue",
  today: "amber",
};

export function formatEstimatedBudget(value: number) {
  return Number.isFinite(value) && value > 0 ? formatCurrency(value) : "Sin estimar";
}

export function formatNextAction(value: string) {
  return value.trim() || "Sin próxima acción";
}

export function formatNextActionDate(value: string) {
  return parseDate(value) ? formatDate(value) : "Sin fecha";
}

export function getLeadFollowUpStats(leads: Lead[], now = new Date()): LeadFollowUpStats {
  const signals = leads.map((lead) => getLeadFollowUpSignals(lead, now));

  return {
    missingNextAction: signals.filter((signal) => signal.missing_next_action).length,
    overdueFollowUps: signals.filter((signal) => signal.overdue).length,
    staleLeads: signals.filter((signal) => signal.stale).length,
    todayFollowUps: signals.filter((signal) => signal.today).length,
  };
}

export function getLeadFollowUpSignals(lead: Lead, now = new Date()) {
  const emptySignals = {
    missing_next_action: false,
    overdue: false,
    stale: false,
    today: false,
  };

  if (!isActiveLead(lead)) {
    return emptySignals;
  }

  const nextActionDate = parseDate(lead.next_action_date);
  const updatedAt = parseDate(lead.updated_at);
  const today = startOfLocalDay(now);

  return {
    missing_next_action: !lead.next_action.trim(),
    overdue: nextActionDate ? startOfLocalDay(nextActionDate).getTime() < today.getTime() : false,
    stale: updatedAt ? startOfLocalDay(updatedAt).getTime() < addDays(today, -followUpWarningDays).getTime() : false,
    today: nextActionDate ? startOfLocalDay(nextActionDate).getTime() === today.getTime() : false,
  };
}

export function getPrimaryLeadFollowUpSignal(lead: Lead, now = new Date()): LeadFollowUpSignal | null {
  const signals = getLeadFollowUpSignals(lead, now);

  if (signals.overdue) return "overdue";
  if (signals.today) return "today";
  if (signals.missing_next_action) return "missing_next_action";
  if (signals.stale) return "stale";

  return null;
}

export function isActiveLead(lead: Pick<Lead, "status">) {
  return activeLeadStatuses.has(lead.status);
}

export function isClosedLead(lead: Pick<Lead, "status">) {
  return closedLeadStatuses.has(lead.status);
}

export function isOpenBudgetLead(lead: Pick<Lead, "status">) {
  return budgetLeadStatuses.has(lead.status);
}

export function isPendingContactLead(lead: Pick<Lead, "next_action" | "status">) {
  return isActiveLead(lead) && (lead.status === "new" || lead.status === "pending_call" || contactActionPattern.test(lead.next_action));
}

export function formatLeadLocation(lead: Pick<Lead, "city" | "province" | "zone">) {
  const zone = getUsefulLocationPart(lead.zone);
  const city = getUsefulLocationPart(lead.city);

  if (zone && city) {
    return `${zone}, ${city}`;
  }

  if (zone) {
    return zone;
  }

  if (city) {
    return city;
  }

  return "Ubicación por definir";
}

export function getDeclaredServiceLabel(lead: Pick<Lead, "service_type" | "title">) {
  const titleService = lead.title.split(/\s+(?:\u2014|\u2013)\s+/)[0]?.trim();

  return titleService && titleService.length >= 3 ? titleService : leadServiceTypeLabels[lead.service_type];
}

export function parseLeadDescription(description: string) {
  const context: Partial<Record<"landingVersion" | "projectStatus" | "source" | "submittedFrom", string>> = {};
  const cleanDescriptionBlocks = description
    .split(/\n{1,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => {
      for (const [key, pattern] of Object.entries(captureContextPatterns)) {
        const match = block.match(pattern);

        if (match) {
          if (key !== "province") {
            context[key as keyof typeof context] = match[1].trim();
          }

          return false;
        }
      }

      return true;
    });

  return {
    captureContext: getCaptureContextItems(context),
    customerDescription: cleanDescriptionBlocks.join("\n\n") || "Sin descripción declarada.",
  };
}

function getUsefulLocationPart(value: string) {
  const trimmed = value.trim();

  if (undefinedLocationValues.has(trimmed.toLowerCase())) {
    return null;
  }

  return trimmed;
}

function getCaptureContextItems(context: Partial<Record<"landingVersion" | "projectStatus" | "source" | "submittedFrom", string>>) {
  const items: CaptureContextItem[] = [];

  if (context.projectStatus) {
    items.push({ label: "Estado del proyecto", value: formatProjectStatus(context.projectStatus) });
  }

  if (context.source) {
    items.push({ label: "Origen", value: formatLeadOrigin(context.source) });
  }

  if (context.landingVersion) {
    items.push({ label: "Versión landing", value: context.landingVersion });
  }

  if (context.submittedFrom) {
    items.push({ label: "Enviado desde", value: formatSubmittedFrom(context.submittedFrom) });
  }

  return items;
}

function formatProjectStatus(value: string) {
  const projectStatusLabels: Record<string, string> = {
    quiero_visita: "Quiere visita",
  };

  return projectStatusLabels[value] ?? formatSlugValue(value);
}

function formatLeadOrigin(value: string) {
  const originLabels: Record<string, string> = {
    diego_public_landing: "Landing Diego",
  };

  return originLabels[value] ?? formatSlugValue(value);
}

function formatSubmittedFrom(value: string) {
  const submittedFromLabels: Record<string, string> = {
    "diego-obras-reformas-landing": "Landing Diego",
    "diego-obras-reformas-landing-local-test": "Landing Diego",
    "diego-obras-reformas-landing-production-test": "Landing Diego",
    "diego-obras-reformas-web": "Web Diego",
  };

  return submittedFromLabels[value] ?? formatSlugValue(value);
}

function formatSlugValue(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function parseDate(value: string) {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}
