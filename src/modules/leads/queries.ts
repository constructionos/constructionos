import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  budgetRanges,
  desiredTimelines,
  leadPriorities,
  leadServiceTypes,
  leadSources,
  leadStatuses,
  type BudgetRange,
  type DesiredTimeline,
  type Lead,
  type LeadPriority,
  type LeadServiceType,
  type LeadSource,
  type LeadStatus,
} from "./types";

type LeadRow = {
  budget_range: string;
  city: string;
  contact_name: string;
  created_at: string;
  description: string | null;
  desired_timeline: string;
  email: string | null;
  estimated_budget: number | string;
  id: string;
  next_action: string | null;
  next_action_date: string | null;
  phone: string | null;
  priority: string;
  province: string;
  service_type: string;
  source: string;
  status: string;
  title: string;
  zone: string | null;
};

const closedLeadStatuses = new Set<LeadStatus>(["discarded", "lost", "won"]);

const leadSelect = `
  id,
  title,
  service_type,
  zone,
  city,
  province,
  estimated_budget,
  budget_range,
  desired_timeline,
  description,
  status,
  priority,
  next_action,
  next_action_date,
  contact_name,
  email,
  phone,
  source,
  created_at
`;

function createLeadStatusCounts() {
  return Object.fromEntries(leadStatuses.map((status) => [status, 0])) as Record<LeadStatus, number>;
}

function getEnumValue<T extends string>(values: readonly T[], value: string, fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

function mapLead(row: LeadRow): Lead {
  return {
    budget_range: getEnumValue(budgetRanges, row.budget_range, "unknown") as BudgetRange,
    city: row.city,
    contact_name: row.contact_name,
    created_at: row.created_at,
    description: row.description ?? "",
    desired_timeline: getEnumValue(desiredTimelines, row.desired_timeline, "unknown") as DesiredTimeline,
    email: row.email ?? "",
    estimated_budget: Number(row.estimated_budget),
    id: row.id,
    next_action: row.next_action ?? "Contactar lead",
    next_action_date: row.next_action_date ?? row.created_at,
    phone: row.phone ?? "",
    priority: getEnumValue(leadPriorities, row.priority, "medium") as LeadPriority,
    province: row.province,
    service_type: getEnumValue(leadServiceTypes, row.service_type, "other") as LeadServiceType,
    source: getEnumValue(leadSources, row.source, "web") as LeadSource,
    status: getEnumValue(leadStatuses, row.status, "new") as LeadStatus,
    title: row.title,
    zone: row.zone ?? "Por definir",
  };
}

async function getAuthenticatedSupabase() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return supabase;
}

export async function getLeads(companyId: string) {
  const supabase = await getAuthenticatedSupabase();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("leads")
    .select(leadSelect)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load leads", error);
    return [];
  }

  return ((data ?? []) as LeadRow[]).map(mapLead);
}

export async function getLeadById(id: string, companyId: string) {
  const supabase = await getAuthenticatedSupabase();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("leads")
    .select(leadSelect)
    .eq("id", id)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load lead", error);
    return null;
  }

  return data ? mapLead(data as LeadRow) : null;
}

export async function getLeadStats(companyId: string) {
  const leads = await getLeads(companyId);
  const pipelineValue = leads.reduce((total, lead) => total + lead.estimated_budget, 0);
  const byStatus = leads.reduce<Record<LeadStatus, number>>(
    (accumulator, lead) => {
      accumulator[lead.status] += 1;
      return accumulator;
    },
    createLeadStatusCounts(),
  );

  return {
    byStatus,
    budgetSent: byStatus.budget_sent,
    newLeads: byStatus.new,
    openLeads: leads.filter((lead) => !closedLeadStatuses.has(lead.status)).length,
    pendingFollowUp: byStatus.pending_call + byStatus.visit_pending,
    pipelineValue,
    totalLeads: leads.length,
    wonLeads: byStatus.won,
  };
}
