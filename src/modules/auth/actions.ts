"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Introduce un email valido."),
  next: z.string().optional(),
  password: z.string().min(1, "Introduce tu contrasena."),
});

export type LoginActionState = {
  fieldErrors?: Partial<Record<keyof z.infer<typeof loginSchema>, string[]>>;
  message?: string;
  ok: boolean;
};

function getSafeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export async function signInAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Revisa los campos marcados.",
      ok: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error("Failed to sign in", error);

    return {
      message: "No hemos podido iniciar sesion con esas credenciales.",
      ok: false,
    };
  }

  redirect(getSafeNextPath(parsed.data.next));
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
