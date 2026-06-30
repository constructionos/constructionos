import { leadStatuses, type Lead, type LeadStatus } from "./types";

const demoLeads: Lead[] = [
  {
    budget_range: "150k_300k",
    city: "Madrid",
    contact_name: "Marta Aldana",
    created_at: "2026-06-24",
    description: "Reforma integral de edificio residencial con tres fases y seguimiento semanal.",
    desired_timeline: "1_3_months",
    email: "marta@aldana.example",
    estimated_budget: 185000,
    id: "lead-001",
    phone: "+34 600 000 101",
    priority: "high",
    province: "Madrid",
    service_type: "renovation",
    status: "budget_preparing",
    title: "Reforma integral de edificio residencial",
    next_action: "Preparar presupuesto por fases",
    next_action_date: "2026-07-02",
    zone: "Centro",
  },
  {
    budget_range: "50k_150k",
    city: "Bilbao",
    contact_name: "Ivan Ruiz",
    created_at: "2026-06-21",
    description: "Coordinacion de obra para local comercial con apertura prevista en septiembre.",
    desired_timeline: "3_6_months",
    email: "ivan@nortearq.example",
    estimated_budget: 94000,
    id: "lead-002",
    phone: "+34 600 000 202",
    priority: "medium",
    province: "Bizkaia",
    service_type: "site_coordination",
    status: "visit_pending",
    title: "Coordinacion de local comercial",
    next_action: "Agendar visita tecnica",
    next_action_date: "2026-07-04",
    zone: "Ensanche",
  },
  {
    budget_range: "over_300k",
    city: "Sevilla",
    contact_name: "Lucia Perez",
    created_at: "2026-06-18",
    description: "Promocion residencial con necesidad de reporting de avance y control de visitas.",
    desired_timeline: "more_than_6_months",
    email: "lucia@habitatsur.example",
    estimated_budget: 320000,
    id: "lead-003",
    phone: "+34 600 000 303",
    priority: "high",
    province: "Sevilla",
    service_type: "new_build",
    status: "new",
    title: "Promocion residencial de obra nueva",
    next_action: "Confirmar alcance",
    next_action_date: "2026-07-05",
    zone: "Nervion",
  },
  {
    budget_range: "150k_300k",
    city: "Valencia",
    contact_name: "Sergio Campos",
    created_at: "2026-06-11",
    description: "Direccion tecnica de nave industrial con seguimiento de cambios previsto.",
    desired_timeline: "1_3_months",
    email: "sergio@tecnoobra.example",
    estimated_budget: 260000,
    id: "lead-004",
    phone: "+34 600 000 404",
    priority: "medium",
    province: "Valencia",
    service_type: "technical_direction",
    status: "budget_sent",
    title: "Direccion tecnica para nave industrial",
    next_action: "Revisar mediciones",
    next_action_date: "2026-07-08",
    zone: "Paterna",
  },
];

const closedLeadStatuses = new Set<LeadStatus>(["discarded", "lost", "won"]);

function createLeadStatusCounts() {
  return Object.fromEntries(leadStatuses.map((status) => [status, 0])) as Record<LeadStatus, number>;
}

export async function getLeads() {
  return demoLeads;
}

export async function getLeadById(id: string) {
  return demoLeads.find((lead) => lead.id === id) ?? null;
}

export async function getLeadStats() {
  const leads = await getLeads();
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
    openLeads: leads.filter((lead) => !closedLeadStatuses.has(lead.status)).length,
    pipelineValue,
    totalLeads: leads.length,
  };
}
