import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { LeadCaptureForm } from "@/modules/leads/components/lead-capture-form";

const companySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function CompanyIntakePage({ params }: { params: Promise<{ companySlug: string }> }) {
  const { companySlug } = await params;

  if (!companySlugPattern.test(companySlug)) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Volver a ConstructionOS
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase text-primary">Intake publico</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-foreground">Solicitar presupuesto</h1>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            Formulario conectado a ConstructionOS para registrar la oportunidad en la empresa correspondiente.
          </p>
        </div>
        <LeadCaptureForm companySlug={companySlug} mode="company" />
      </main>
    </div>
  );
}
