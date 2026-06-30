import { Badge } from "@/components/ui/badge";
import { leadStatusLabels, type LeadStatus } from "../types";

const statusTones: Record<LeadStatus, "neutral" | "green" | "amber" | "blue" | "red"> = {
  budget_preparing: "amber",
  budget_sent: "blue",
  discarded: "neutral",
  lost: "red",
  negotiation: "amber",
  new: "blue",
  pending_call: "amber",
  visit_done: "green",
  visit_pending: "amber",
  won: "green",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={statusTones[status]}>{leadStatusLabels[status]}</Badge>;
}
