"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { leadServiceTypes } from "./types";

const leadCaptureSchema = z.object({
  city: z.string().trim().min(2, "Indica la ciudad."),
  contact_name: z.string().trim().min(2, "Indica una persona de contacto."),
  email: z.string().trim().email("El email no tiene un formato valido."),
  service_type: z.enum(leadServiceTypes),
  title: z.string().trim().min(3, "Indica la oportunidad de obra."),
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
    city: formData.get("city"),
    contact_name: formData.get("contact_name"),
    email: formData.get("email"),
    service_type: formData.get("service_type"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisa los campos marcados.",
      ok: false,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/leads");

  return {
    message: "Lead registrado para seguimiento comercial.",
    ok: true,
  };
}
