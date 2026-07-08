"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveCompanyForUser } from "@/modules/companies/queries";
import { getQuickActionPatch, leadQuickActionIds } from "./quick-actions";
import { budgetRanges, desiredTimelines, leadPriorities, leadServiceTypes, leadSources, leadStatuses, type LeadStatus } from "./types";

const leadCaptureSchema = z.object({
  budget_range: z.enum(budgetRanges),
  city: z.string().trim().min(2, "Indica la ciudad."),
  contact_name: z.string().trim().min(2, "Indica una persona de contacto."),
  description: z.string().trim().min(10, "Describe brevemente la oportunidad.").max(2000, "La descripcion es demasiado larga."),
  desired_timeline: z.enum(desiredTimelines),
  email: z.string().trim().email("El email no tiene un formato valido."),
  phone: z
    .string()
    .trim()
    .min(6, "Indica un telefono de contacto.")
    .max(40, "El telefono es demasiado largo.")
    .regex(/^[0-9+(). -]+$/, "El telefono solo puede incluir numeros, espacios y simbolos basicos."),
  service_type: z.enum(leadServiceTypes),
  title: z.string().trim().min(3, "Indica la oportunidad de obra."),
  website: z.string().trim().optional(),
});

const optionalContactEmailSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  },
  z.string().email("El email no tiene un formato valido.").optional(),
);

const optionalContactPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  },
  z
    .string()
    .min(6, "Indica un telefono de contacto.")
    .max(40, "El telefono es demasiado largo.")
    .regex(/^[0-9+(). -]+$/, "El telefono solo puede incluir numeros, espacios y simbolos basicos.")
    .optional(),
);

const companyLeadCaptureSchema = leadCaptureSchema
  .omit({
    email: true,
    phone: true,
  })
  .extend({
    company_slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El formulario no esta disponible."),
    email: optionalContactEmailSchema,
    phone: optionalContactPhoneSchema,
  })
  .refine((value) => value.email || value.phone, {
    message: "Indica al menos email o telefono para poder contactar contigo.",
    path: ["email"],
  });

export type LeadActionState = {
  fieldErrors?: Partial<Record<keyof z.infer<typeof companyLeadCaptureSchema>, string[]>>;
  message?: string;
  ok: boolean;
};

const leadWorkflowSchema = z.object({
  id: z.string().uuid("Lead no valido."),
  next_action: z.string().trim().min(2, "Indica la siguiente tarea.").max(180, "La siguiente tarea es demasiado larga."),
  next_action_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Indica una fecha valida."),
  priority: z.enum(leadPriorities),
  status: z.enum(leadStatuses),
});

export type LeadWorkflowActionState = {
  fieldErrors?: Partial<Record<keyof z.infer<typeof leadWorkflowSchema>, string[]>>;
  message?: string;
  ok: boolean;
};

const optionalEmailSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  },
  z.string().email("El email no tiene un formato valido.").optional(),
);

const optionalDateSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Indica una fecha valida.").optional(),
);

const leadQuickActionSchema = z.object({
  action_date: optionalDateSchema,
  action_id: z.enum(leadQuickActionIds),
  company_slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Empresa no valida."),
  id: z.string().uuid("Lead no valido."),
});

export type LeadQuickActionState = {
  fieldErrors?: Partial<Record<keyof z.infer<typeof leadQuickActionSchema>, string[]>>;
  message?: string;
  ok: boolean;
};

const optionalTextSchema = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    },
    z.string().max(maxLength, "El texto es demasiado largo.").optional(),
  );

const manualLeadSchema = z.object({
  budget_range: z.enum(budgetRanges),
  city: z.string().trim().min(2, "Indica la ciudad.").max(120, "La ciudad es demasiado larga."),
  company_slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Empresa no valida."),
  contact_name: z.string().trim().min(2, "Indica una persona de contacto.").max(160, "El contacto es demasiado largo."),
  description: z
    .string()
    .trim()
    .min(5, "Resume la conversacion o necesidad.")
    .max(2000, "La descripcion es demasiado larga."),
  desired_timeline: z.enum(desiredTimelines),
  email: optionalEmailSchema,
  next_action: optionalTextSchema(180),
  next_action_date: optionalDateSchema,
  phone: z
    .string()
    .trim()
    .min(6, "Indica un telefono de contacto.")
    .max(40, "El telefono es demasiado largo.")
    .regex(/^[0-9+(). -]+$/, "El telefono solo puede incluir numeros, espacios y simbolos basicos."),
  priority: z.enum(leadPriorities),
  province: optionalTextSchema(120),
  service_type: z.enum(leadServiceTypes),
  source: z.enum(leadSources),
  title: z.string().trim().min(3, "Indica la oportunidad.").max(200, "El titulo es demasiado largo."),
});

export type ManualLeadActionState = {
  fieldErrors?: Partial<Record<keyof z.infer<typeof manualLeadSchema>, string[]>>;
  message?: string;
  ok: boolean;
};

export async function createLeadAction(
  _previousState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const parsed = leadCaptureSchema.safeParse({
    budget_range: formData.get("budget_range"),
    city: formData.get("city"),
    contact_name: formData.get("contact_name"),
    description: formData.get("description"),
    desired_timeline: formData.get("desired_timeline"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    service_type: formData.get("service_type"),
    title: formData.get("title"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisa los campos marcados.",
      ok: false,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("create_public_lead", {
      p_budget_range: parsed.data.budget_range,
      p_city: parsed.data.city,
      p_contact_name: parsed.data.contact_name,
      p_description: parsed.data.description,
      p_desired_timeline: parsed.data.desired_timeline,
      p_email: parsed.data.email,
      p_honeypot: parsed.data.website ?? "",
      p_phone: parsed.data.phone,
      p_service_type: parsed.data.service_type,
      p_title: parsed.data.title,
    });

    if (error) {
      console.error("Failed to create public lead", error);

      return {
        message: "No hemos podido registrar el lead. Intentalo de nuevo.",
        ok: false,
      };
    }
  } catch (error) {
    console.error("Public lead capture is not configured", error);

    return {
      message: "La captacion no esta configurada todavia.",
      ok: false,
    };
  }

  revalidatePath("/");

  return {
    message: "Lead registrado para seguimiento comercial.",
    ok: true,
  };
}

export async function createCompanyPublicLeadAction(
  _previousState: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const parsed = companyLeadCaptureSchema.safeParse({
    budget_range: formData.get("budget_range"),
    city: formData.get("city"),
    company_slug: formData.get("company_slug"),
    contact_name: formData.get("contact_name"),
    description: formData.get("description"),
    desired_timeline: formData.get("desired_timeline"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    service_type: formData.get("service_type"),
    title: formData.get("title"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisa los campos marcados.",
      ok: false,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.rpc("create_public_lead_for_company", {
      p_budget_range: parsed.data.budget_range,
      p_city: parsed.data.city,
      p_company_slug: parsed.data.company_slug,
      p_contact_name: parsed.data.contact_name,
      p_description: parsed.data.description,
      p_desired_timeline: parsed.data.desired_timeline,
      p_email: parsed.data.email ?? null,
      p_honeypot: parsed.data.website ?? "",
      p_phone: parsed.data.phone ?? null,
      p_service_type: parsed.data.service_type,
      p_title: parsed.data.title,
    });

    if (error) {
      console.error("Failed to create company public lead", error);

      return {
        message: "No hemos podido registrar el lead. Intentalo de nuevo.",
        ok: false,
      };
    }
  } catch (error) {
    console.error("Company public lead capture is not configured", error);

    return {
      message: "La captacion no esta configurada todavia.",
      ok: false,
    };
  }

  revalidatePath(`/intake/${parsed.data.company_slug}`);

  return {
    message: "Lead registrado para seguimiento comercial.",
    ok: true,
  };
}

export async function updateLeadWorkflowAction(
  _previousState: LeadWorkflowActionState,
  formData: FormData,
): Promise<LeadWorkflowActionState> {
  const parsed = leadWorkflowSchema.safeParse({
    id: formData.get("id"),
    next_action: formData.get("next_action"),
    next_action_date: formData.get("next_action_date"),
    priority: formData.get("priority"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisa los campos marcados.",
      ok: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "Inicia sesion para actualizar el lead.",
      ok: false,
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .update({
      next_action: parsed.data.next_action,
      next_action_date: parsed.data.next_action_date,
      priority: parsed.data.priority,
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update lead workflow", error);

    return {
      message: "No hemos podido guardar los cambios.",
      ok: false,
    };
  }

  if (!data) {
    return {
      message: "No se ha encontrado el lead o no tienes acceso.",
      ok: false,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/leads");
  revalidatePath(`/leads/${parsed.data.id}`);

  return {
    message: "Cambios guardados.",
    ok: true,
  };
}

export async function applyLeadQuickAction(
  _previousState: LeadQuickActionState,
  formData: FormData,
): Promise<LeadQuickActionState> {
  const parsed = leadQuickActionSchema.safeParse({
    action_date: formData.get("action_date"),
    action_id: formData.get("action_id"),
    company_slug: formData.get("company_slug"),
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisa los campos marcados.",
      ok: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "Inicia sesion para actualizar el lead.",
      ok: false,
    };
  }

  const companyContext = await getActiveCompanyForUser(supabase, user.id, parsed.data.company_slug);

  if (!companyContext) {
    return {
      message: "Tu usuario no esta asociado a esta empresa.",
      ok: false,
    };
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, status")
    .eq("id", parsed.data.id)
    .eq("company_id", companyContext.activeCompany.id)
    .maybeSingle();

  if (leadError) {
    console.error("Failed to load lead for quick action", leadError);

    return {
      message: "No hemos podido aplicar la accion.",
      ok: false,
    };
  }

  const leadStatus = lead?.status && leadStatuses.includes(lead.status as LeadStatus) ? (lead.status as LeadStatus) : null;

  if (!lead?.id || !leadStatus) {
    return {
      message: "No se ha encontrado el lead o no tienes acceso.",
      ok: false,
    };
  }

  const patch = getQuickActionPatch(parsed.data.action_id, { status: leadStatus }, parsed.data.action_date);

  if (!patch) {
    return {
      message: "Esta accion no esta disponible para la fase actual.",
      ok: false,
    };
  }

  const { data, error } = await supabase
    .from("leads")
    .update({
      next_action: patch.next_action,
      next_action_date: patch.next_action_date,
      status: patch.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id)
    .eq("company_id", companyContext.activeCompany.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to apply lead quick action", error);

    return {
      message: "No hemos podido aplicar la accion.",
      ok: false,
    };
  }

  if (!data) {
    return {
      message: "No se ha encontrado el lead o no tienes acceso.",
      ok: false,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/leads");
  revalidatePath(`/dashboard?company=${companyContext.activeCompany.slug}`);
  revalidatePath(`/leads?company=${companyContext.activeCompany.slug}`);
  revalidatePath(`/leads/${parsed.data.id}`);
  revalidatePath(`/leads/${parsed.data.id}?company=${companyContext.activeCompany.slug}`);

  return {
    message: "Accion aplicada.",
    ok: true,
  };
}

export async function createManualLeadAction(
  _previousState: ManualLeadActionState,
  formData: FormData,
): Promise<ManualLeadActionState> {
  const parsed = manualLeadSchema.safeParse({
    budget_range: formData.get("budget_range"),
    city: formData.get("city"),
    contact_name: formData.get("contact_name"),
    description: formData.get("description"),
    desired_timeline: formData.get("desired_timeline"),
    email: formData.get("email"),
    next_action: formData.get("next_action"),
    next_action_date: formData.get("next_action_date"),
    phone: formData.get("phone"),
    priority: formData.get("priority"),
    province: formData.get("province"),
    service_type: formData.get("service_type"),
    source: formData.get("source"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisa los campos marcados.",
      ok: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "Inicia sesion para crear leads.",
      ok: false,
    };
  }

  const companyContext = await getActiveCompanyForUser(supabase, user.id, parsed.data.company_slug);

  if (!companyContext) {
    return {
      message: "Tu usuario no esta asociado a ninguna empresa.",
      ok: false,
    };
  }

  const values = parsed.data;
  const { data, error } = await supabase
    .from("leads")
    .insert({
      budget_range: values.budget_range,
      city: values.city,
      company_id: companyContext.activeCompany.id,
      contact_name: values.contact_name,
      description: values.description,
      desired_timeline: values.desired_timeline,
      email: values.email ?? null,
      estimated_budget: 0,
      next_action: values.next_action ?? "Contactar lead",
      next_action_date: values.next_action_date ?? null,
      phone: values.phone,
      priority: values.priority,
      province: values.province ?? "Por definir",
      service_type: values.service_type,
      source: values.source,
      status: "new",
      title: values.title,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to create manual lead", error);

    return {
      message: "No hemos podido crear el lead.",
      ok: false,
    };
  }

  if (!data?.id) {
    return {
      message: "No se ha podido confirmar el lead creado.",
      ok: false,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/leads");
  revalidatePath(`/dashboard?company=${companyContext.activeCompany.slug}`);
  revalidatePath(`/leads?company=${companyContext.activeCompany.slug}`);
  redirect(`/leads/${data.id}?company=${companyContext.activeCompany.slug}`);
}
