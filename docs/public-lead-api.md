# Public Lead API

Endpoint publico para recibir leads desde landings externas sin exponer Supabase en la web externa.

## Endpoint

`POST /api/public/leads`

Tambien responde a `OPTIONS` para CORS.

## Payload

```json
{
  "companySlug": "diego-obras-reformas",
  "source": "diego_public_landing",
  "title": "Reforma integral en Avila",
  "contactName": "Nombre cliente",
  "email": null,
  "phone": "+34 600 000 000",
  "city": "Avila",
  "province": "Avila",
  "serviceType": "reforma_integral",
  "budgetRange": "50k_150k",
  "desiredTimeline": "1_3_months",
  "projectStatus": "quiero_visita",
  "description": "Descripcion de la obra...",
  "metadata": {
    "landingVersion": "v1",
    "submittedFrom": "diego-obras-reformas-landing"
  },
  "honeypot": ""
}
```

`company_id` nunca se envia desde la landing. El tenant publico se identifica por `companySlug`, y la base de datos resuelve internamente la empresa si `public_intake_enabled` esta activo.

## Ejemplo Fetch

```ts
await fetch("https://constructionos-constructionos.vercel.app/api/public/leads", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    companySlug: "diego-obras-reformas",
    source: "diego_public_landing",
    title: "Reforma integral en Avila",
    contactName: "Nombre cliente",
    email: null,
    phone: "+34 600 000 000",
    city: "Avila",
    province: "Avila",
    serviceType: "reforma_integral",
    budgetRange: "50k_150k",
    desiredTimeline: "1_3_months",
    projectStatus: "quiero_visita",
    description: "Descripcion de la obra...",
    metadata: {
      landingVersion: "v1",
      submittedFrom: "diego-obras-reformas-landing",
    },
    honeypot: "",
  }),
});
```

## Respuestas

Exito:

`HTTP 201 Created`

```json
{
  "ok": true,
  "leadId": "00000000-0000-0000-0000-000000000000",
  "message": "Solicitud recibida correctamente."
}
```

Error:

```json
{
  "ok": false,
  "error": "Mensaje seguro"
}
```

Los errores no devuelven stack traces ni detalles internos de Supabase.

## CORS

El endpoint no usa wildcard. La allowlist esta definida en `src/app/api/public/leads/route.ts` e incluye:

- produccion de ConstructionOS
- produccion/preview de la landing Diego en Vercel
- localhost para desarrollo

## Seguridad

- No usa `service_role`.
- Usa el cliente servidor de Supabase con publishable key.
- No inserta directamente en `leads`.
- Llama a la RPC existente `create_public_lead_for_company`.
- No acepta `company_id` desde cliente.
- Supabase no se expone en la landing externa.
- RLS, grants y migraciones no cambian en esta feature.
