"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { budgetRanges, desiredTimelines, leadServiceTypes } from "./types";

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

export type LeadActionState = {
  fieldErrors?: Partial<Record<keyof z.infer<typeof leadCaptureSchema>, string[]>>;
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
