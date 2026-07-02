export const leadStatuses = [
  "new",
  "pending_call",
  "visit_pending",
  "visit_done",
  "budget_preparing",
  "budget_sent",
  "negotiation",
  "won",
  "lost",
  "discarded",
] as const;
export const leadPriorities = ["low", "medium", "high"] as const;
export const leadServiceTypes = ["renovation", "new_build", "technical_direction", "site_coordination", "other"] as const;
export const leadSources = ["web", "whatsapp", "phone", "email", "manual", "referral", "ads"] as const;
export const budgetRanges = ["under_50k", "50k_150k", "150k_300k", "over_300k", "unknown"] as const;
export const desiredTimelines = ["asap", "1_3_months", "3_6_months", "more_than_6_months", "unknown"] as const;

export type LeadStatus = (typeof leadStatuses)[number];
export type LeadPriority = (typeof leadPriorities)[number];
export type LeadServiceType = (typeof leadServiceTypes)[number];
export type LeadSource = (typeof leadSources)[number];
export type BudgetRange = (typeof budgetRanges)[number];
export type DesiredTimeline = (typeof desiredTimelines)[number];

export const leadStatusLabels: Record<LeadStatus, string> = {
  budget_preparing: "Preparando presupuesto",
  budget_sent: "Presupuesto enviado",
  discarded: "Descartado",
  lost: "Perdido",
  negotiation: "En negociacion",
  new: "Nuevo",
  pending_call: "Pendiente de llamar",
  visit_done: "Visita realizada",
  visit_pending: "Visita pendiente",
  won: "Ganado",
};

export const leadServiceTypeLabels: Record<LeadServiceType, string> = {
  new_build: "Obra nueva",
  other: "Otro servicio",
  renovation: "Reforma",
  site_coordination: "Coordinacion de obra",
  technical_direction: "Direccion tecnica",
};

export const budgetRangeLabels: Record<BudgetRange, string> = {
  "150k_300k": "150k-300k",
  "50k_150k": "50k-150k",
  over_300k: "Mas de 300k",
  under_50k: "Menos de 50k",
  unknown: "Por definir",
};

export const desiredTimelineLabels: Record<DesiredTimeline, string> = {
  "1_3_months": "1-3 meses",
  "3_6_months": "3-6 meses",
  asap: "Lo antes posible",
  more_than_6_months: "Mas de 6 meses",
  unknown: "Por definir",
};

export const leadPriorityLabels: Record<LeadPriority, string> = {
  high: "Alta",
  low: "Baja",
  medium: "Media",
};

export const leadSourceLabels: Record<LeadSource, string> = {
  ads: "Ads",
  email: "Email",
  manual: "Manual",
  phone: "Llamada",
  referral: "Referido",
  web: "Web",
  whatsapp: "WhatsApp",
};

export type Lead = {
  budget_range: BudgetRange;
  city: string;
  contact_name: string;
  created_at: string;
  description: string;
  desired_timeline: DesiredTimeline;
  email: string;
  estimated_budget: number;
  id: string;
  next_action: string;
  next_action_date: string;
  phone: string;
  priority: LeadPriority;
  province: string;
  service_type: LeadServiceType;
  source: LeadSource;
  status: LeadStatus;
  title: string;
  zone: string;
};
