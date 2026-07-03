"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClipboardList, LayoutDashboard, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Oportunidades", icon: ClipboardList },
  { href: "/leads/new", label: "Nueva oportunidad", icon: Plus },
];

function hrefWithCompany(path: string, companySlug: string | null) {
  if (!companySlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(companySlug)) {
    return path;
  }

  return `${path}?company=${encodeURIComponent(companySlug)}`;
}

export function DashboardNavigation({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const searchParams = useSearchParams();
  const companySlug = searchParams.get("company");

  return (
    <>
      {navigation.map((item) => (
        <Link
          className={
            variant === "sidebar"
              ? cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/74 transition hover:bg-white/10 hover:text-white")
              : "rounded-md px-3 py-2 hover:bg-muted hover:text-foreground"
          }
          href={hrefWithCompany(item.href, companySlug)}
          key={item.href}
        >
          {variant === "sidebar" ? <item.icon aria-hidden="true" size={17} /> : null}
          {item.label}
        </Link>
      ))}
    </>
  );
}
