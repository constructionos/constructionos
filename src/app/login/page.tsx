import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/modules/auth/components/login-form";

export const dynamic = "force-dynamic";

function getSafeNextPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = getSafeNextPath(next);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link className="mx-auto flex w-fit items-center gap-2 font-semibold" href="/">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 aria-hidden="true" size={18} />
          </span>
          ConstructionOS
        </Link>
        <LoginForm nextPath={nextPath} />
      </div>
    </main>
  );
}
