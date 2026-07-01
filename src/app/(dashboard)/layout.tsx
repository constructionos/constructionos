import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getAuthenticatedUserContext } from "@/modules/auth/guards";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { email, membership } = await getAuthenticatedUserContext();

  if (!membership) {
    return (
      <DashboardShell userEmail={email}>
        <div className="mx-auto max-w-3xl">
          <Card className="p-6">
            <h1 className="text-2xl font-semibold">Tu usuario no esta asociado a ninguna empresa</h1>
            <p className="mt-3 text-muted-foreground">
              Pide a un administrador que cree tu membership en ConstructionOS antes de acceder a datos reales.
            </p>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  return <DashboardShell userEmail={email}>{children}</DashboardShell>;
}
