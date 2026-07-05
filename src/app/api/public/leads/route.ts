import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { leadServiceTypes, type BudgetRange, type DesiredTimeline, type LeadServiceType } from "@/modules/leads/types";

const ALLOWED_ORIGINS = [
  "https://constructionos-constructionos.vercel.app",
  "https://diego-obras-reformas-web.vercel.app",
  "https://diego-obras-reformas-gzr4czq70-construction-os-lab.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
] as const;

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/diego-obras-reformas-[a-z0-9-]+-construction-os-lab\.vercel\.app$/,
] as const;

const landingServiceTypeSchema = z.enum([
  "reforma_integral",
  "local_negocio",
  "piscina_exterior",
  "fachada",
  "bano_completo",
  "alojamiento_turistico",
  "otro",
  ...leadServiceTypes,
]);

const landingBudgetRangeSchema = z.enum([
  "less_15k",
  "15k_50k",
  "50k_150k",
  "150k_300k",
  "more_150k",
  "under_50k",
  "over_300k",
  "unknown",
]);

const landingDesiredTimelineSchema = z.enum([
  "asap",
  "1_3_months",
  "3_6_months",
  "more_6_months",
  "more_than_6_months",
  "unknown",
]);

const optionalEmailSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  },
  z.string().email("Email no valido.").max(254, "Email demasiado largo.").optional(),
);

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  },
  z
    .string()
    .min(6, "Telefono no valido.")
    .max(40, "Telefono demasiado largo.")
    .regex(/^[0-9+(). -]+$/, "Telefono no valido.")
    .optional(),
);

const publicLeadApiSchema = z
  .object({
    budgetRange: landingBudgetRangeSchema,
    city: z.string().trim().min(2, "Ciudad no valida.").max(120, "Ciudad demasiado larga."),
    companySlug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Empresa no valida."),
    contactName: z.string().trim().min(2, "Contacto no valido.").max(160, "Contacto demasiado largo."),
    description: z.string().trim().min(10, "Descripcion no valida.").max(2000, "Descripcion demasiado larga."),
    desiredTimeline: landingDesiredTimelineSchema,
    email: optionalEmailSchema,
    honeypot: z.string().trim().max(0, "Solicitud no valida.").optional().default(""),
    metadata: z
      .object({
        landingVersion: z.string().trim().max(40).optional(),
        submittedFrom: z.string().trim().max(120).optional(),
      })
      .optional(),
    phone: optionalPhoneSchema,
    projectStatus: z.string().trim().max(80).optional(),
    province: z.string().trim().max(120).nullable().optional(),
    serviceType: landingServiceTypeSchema,
    source: z.string().trim().max(80).optional(),
    title: z.string().trim().min(3, "Titulo no valido.").max(200, "Titulo demasiado largo."),
  })
  .refine((value) => value.email || value.phone, {
    message: "Indica al menos email o telefono.",
    path: ["email"],
  });

type PublicLeadApiPayload = z.infer<typeof publicLeadApiSchema>;

function mapLandingServiceType(value: PublicLeadApiPayload["serviceType"]): LeadServiceType {
  const serviceTypeMap: Record<PublicLeadApiPayload["serviceType"], LeadServiceType> = {
    alojamiento_turistico: "other",
    bano_completo: "renovation",
    fachada: "other",
    local_negocio: "other",
    new_build: "new_build",
    other: "other",
    otro: "other",
    piscina_exterior: "other",
    reforma_integral: "renovation",
    renovation: "renovation",
    site_coordination: "site_coordination",
    technical_direction: "technical_direction",
  };

  return serviceTypeMap[value];
}

function mapLandingBudgetRange(value: PublicLeadApiPayload["budgetRange"]): BudgetRange {
  const budgetRangeMap: Record<PublicLeadApiPayload["budgetRange"], BudgetRange> = {
    "150k_300k": "150k_300k",
    "15k_50k": "under_50k",
    "50k_150k": "50k_150k",
    less_15k: "under_50k",
    more_150k: "150k_300k",
    over_300k: "over_300k",
    under_50k: "under_50k",
    unknown: "unknown",
  };

  return budgetRangeMap[value];
}

function mapLandingDesiredTimeline(value: PublicLeadApiPayload["desiredTimeline"]): DesiredTimeline {
  const desiredTimelineMap: Record<PublicLeadApiPayload["desiredTimeline"], DesiredTimeline> = {
    "1_3_months": "1_3_months",
    "3_6_months": "3_6_months",
    asap: "asap",
    more_6_months: "more_than_6_months",
    more_than_6_months: "more_than_6_months",
    unknown: "unknown",
  };

  return desiredTimelineMap[value];
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: getCorsHeaders(request),
    status: 204,
  });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  if (!isOriginAllowed(request.headers.get("origin"))) {
    return jsonResponse({ error: "Origen no permitido.", ok: false }, 403, corsHeaders);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "JSON no valido.", ok: false }, 400, corsHeaders);
  }

  const parsed = publicLeadApiSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse({ error: "Revisa los datos enviados.", ok: false }, 400, corsHeaders);
  }

  const values = parsed.data;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("create_public_lead_for_company", {
      p_budget_range: mapLandingBudgetRange(values.budgetRange),
      p_city: values.city,
      p_company_slug: values.companySlug,
      p_contact_name: values.contactName,
      p_description: buildDescription(values),
      p_desired_timeline: mapLandingDesiredTimeline(values.desiredTimeline),
      p_email: values.email ?? null,
      p_honeypot: values.honeypot,
      p_phone: values.phone ?? null,
      p_service_type: mapLandingServiceType(values.serviceType),
      p_title: values.title,
    });

    if (error) {
      console.error("Public lead API failed", error);
      if (isPublicIntakeUnavailableError(error)) {
        return jsonResponse({ error: "La captación no está disponible.", ok: false }, 404, corsHeaders);
      }

      return jsonResponse({ error: "No hemos podido registrar la solicitud.", ok: false }, 500, corsHeaders);
    }

    if (!data) {
      console.error("Public lead API did not return a lead id");
      return jsonResponse({ error: "No hemos podido registrar la solicitud.", ok: false }, 500, corsHeaders);
    }

    return jsonResponse(
      {
        leadId: data,
        message: "Solicitud recibida correctamente.",
        ok: true,
      },
      201,
      corsHeaders,
    );
  } catch (error) {
    console.error("Public lead API is not configured", error);
    return jsonResponse({ error: "La captacion no esta disponible.", ok: false }, 500, corsHeaders);
  }
}

function buildDescription(values: PublicLeadApiPayload) {
  const details = [
    values.description,
    values.province ? `Provincia: ${values.province}` : null,
    values.projectStatus ? `Estado del proyecto: ${values.projectStatus}` : null,
    values.source ? `Origen landing: ${values.source}` : null,
    values.metadata?.landingVersion ? `Landing version: ${values.metadata.landingVersion}` : null,
    values.metadata?.submittedFrom ? `Submitted from: ${values.metadata.submittedFrom}` : null,
  ].filter(Boolean);

  return details.join("\n\n").slice(0, 2000);
}

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = new Headers({
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  });

  if (isOriginAllowed(origin) && origin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}

function isOriginAllowed(origin: string | null) {
  if (!origin) return true;

  return ALLOWED_ORIGINS.includes(origin as (typeof ALLOWED_ORIGINS)[number]) || ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
}

function isPublicIntakeUnavailableError(error: { code?: string; message?: string }) {
  return error.code === "23503" || error.message?.includes("Public intake not available");
}

function jsonResponse(body: unknown, status: number, headers: Headers) {
  return NextResponse.json(body, {
    headers,
    status,
  });
}
