import { formatCurrency } from "@/lib/utils/format";
import { leadServiceTypeLabels, type Lead } from "./types";

const undefinedLocationValues = new Set(["", "por definir"]);

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

export function formatEstimatedBudget(value: number) {
  return Number.isFinite(value) && value > 0 ? formatCurrency(value) : "Sin estimar";
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
