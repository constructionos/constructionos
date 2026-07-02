import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

type MembershipCompanyRow = {
  companies:
    | {
        id: string;
        name: string;
        slug: string | null;
      }
    | {
        id: string;
        name: string;
        slug: string | null;
      }[]
    | null;
  created_at: string;
};

export type CompanySummary = {
  id: string;
  name: string;
  slug: string;
};

export type ActiveCompanyContext = {
  activeCompany: CompanySummary;
  companies: CompanySummary[];
};

export function normalizeCompanySlug(value?: string | string[]) {
  const slug = Array.isArray(value) ? value[0] : value;

  if (!slug) {
    return undefined;
  }

  const trimmed = slug.trim();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed) ? trimmed : undefined;
}

export async function getUserCompaniesForUser(supabase: SupabaseServerClient, userId: string): Promise<CompanySummary[]> {
  const { data, error } = await supabase
    .from("memberships")
    .select("created_at, companies(id, name, slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load user companies", error);
    return [];
  }

  return ((data ?? []) as MembershipCompanyRow[])
    .map((row) => {
      const company = Array.isArray(row.companies) ? row.companies[0] : row.companies;

      if (!company?.id || !company.slug) {
        return null;
      }

      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
      };
    })
    .filter((company): company is CompanySummary => Boolean(company));
}

export async function getUserCompanies() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return getUserCompaniesForUser(supabase, user.id);
}

export async function getActiveCompany(searchParamsCompanySlug?: string | string[]): Promise<ActiveCompanyContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const companies = await getUserCompaniesForUser(supabase, user.id);

  if (!companies.length) {
    return null;
  }

  const requestedSlug = normalizeCompanySlug(searchParamsCompanySlug);
  const activeCompany = requestedSlug ? companies.find((company) => company.slug === requestedSlug) : companies[0];

  if (!activeCompany) {
    return null;
  }

  return {
    activeCompany,
    companies,
  };
}

export async function getActiveCompanyForUser(
  supabase: SupabaseServerClient,
  userId: string,
  companySlug?: string,
): Promise<ActiveCompanyContext | null> {
  const companies = await getUserCompaniesForUser(supabase, userId);

  if (!companies.length) {
    return null;
  }

  const normalizedSlug = normalizeCompanySlug(companySlug);
  const activeCompany = normalizedSlug ? companies.find((company) => company.slug === normalizedSlug) : companies[0];

  if (!activeCompany) {
    return null;
  }

  return {
    activeCompany,
    companies,
  };
}
