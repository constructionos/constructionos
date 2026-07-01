import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthenticatedMembership = {
  company_id: string;
  role: "owner" | "admin" | "member";
};

export type AuthenticatedUserContext = {
  email: string;
  membership: AuthenticatedMembership | null;
  userId: string;
};

export async function getAuthenticatedUserContext(): Promise<AuthenticatedUserContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: membership, error } = await supabase
    .from("memberships")
    .select("company_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load user membership", error);
  }

  return {
    email: user.email ?? "Usuario",
    membership: membership as AuthenticatedMembership | null,
    userId: user.id,
  };
}
