# Phase 1 Scope — YFC Pilot

Minimum launchable scope for FilmComOS Phase 1, targeting the Yosemite Film Commission (YFC) pilot tenant. This is a tightening of the spec's own Phase 1 (Weeks 3–6 in `FilmOS_YFC_Product_Spec_v2.docx` §9) — a launchable foundation that preserves the full-vision architecture without overcommitting.

## Guiding principles

1. **Multi-tenant from line one**, even with only YFC in the DB. `tenant_id` on every table, RLS scaffolded — no "we'll retrofit it later."
2. **Static > AI, for now.** Ship the M2 permit content as authoritative copy + a downloadable PDF. No conversational wizard yet. Same for M1: category browse + detail pages, no LLM search.
3. **One real location, done fully.** Stockton Creek (the GIS data is in hand) proves the location detail UX end-to-end. 2–3 additional placeholder locations at most — don't gate launch on photography.
4. **Concierge = intake form.** A human-routed "Plan Your Production" form that emails YFC. No AI concierge chatbot yet.
5. **Respect the existing Tourism Bureau relationship.** Public copy positions YFC as *supplementing* the existing Mariposa County Film Commission (operated by the Yosemite Mariposa County Tourism Bureau), not replacing it. Alignment conversation happens **before** public launch.

## Scope — what ships in Phase 1

| Area | Scope | Notes |
|---|---|---|
| **Infra** | Next 16 + Supabase project + Vercel deploy; Supabase schema: `tenants`, `locations`, `location_media`, `vendors`, `productions`, `intake_submissions`, `users` — all with `tenant_id` + RLS | Seed YFC as tenant #1. No onboarding wizard yet. |
| **Public site** | Homepage, Locations (list + map + detail), Why Film Here, Permits (two-track static), Incentives (static explainer + PDF), About, Plan Your Production | Editorial tone from the wireframes. Mobile-first. |
| **M1 — Locations** | Category browse (Pastoral / Natural / Built), map view (Leaflet or Google Maps), detail page template | **Stockton Creek is fully built** with GeoJSON overlay + 6 trail segments. 2–3 stub locations with cinematic hero photography. |
| **M2 — Permits** | Two-track static content (Mariposa private-land / NPS), downloadable **Permitting Guide PDF**, current NPS fee table, list of automatic disqualifiers (drones, night shoots, weekend-only, wilderness <90 days) | No AI wizard. No fee calculator. Just accurate, authoritative copy. |
| **M2 — Incentives** | Static CA Film Tax Credit + out-of-zone uplift explainer, downloadable Infosheet PDF | No interactive calculator yet. |
| **M3 — Vendors** | Read-only directory populated from the Mariposa Chamber seed data, filterable by category | No self-service vendor portal. No ratings. No AI matching. Manual import via SQL/CSV. |
| **M4 — Concierge** | `Plan Your Production` intake form → Supabase + transactional email to YFC staff (Resend) | No chatbot. Form is the MVP of the concierge. |
| **M5 — Dashboard** | **Explicitly deferred.** No authenticated surfaces in Phase 1. | |
| **Admin** | No CMS. YFC staff edits content via PRs or SQL for now. | Directus/admin UI is Phase 2+. |
| **Design** | Dark/cinematic palette from wireframes, component library mapped from Figma | Photography is the critical-path asset. |
| **Auth** | Not required for public pages; skip OAuth/Supabase Auth entirely in Phase 1 | Auth lands with M5. |
| **i18n** | English only | Spanish/French/etc. are Phase 2+. |

## Out of Phase 1 (deferred to Phase 2+)

- AI Location Scout (natural-language search)
- AI Permit Wizard
- AI Concierge chatbot
- Incentives calculator (interactive out-of-zone uplift estimator)
- Vendor self-service portal
- Vendor ratings system
- E-signatures
- Call sheets / crew management
- Payments (Stripe Connect, production invoicing)
- Production Dashboard (M5)
- Autonomous agents (vendor discovery, vendor outreach, chamber monitoring, economic-impact reporting)
- Economic-impact tracking
- Multi-language (i18n)
- Custom-domain routing per tenant
- Second tenant onboarding
- Mobile app (React Native / Expo)

## Pre-Phase-1 blockers

These aren't code — they're decisions and relationships that gate the scope above. See `phase-1-blockers.md` for the actionable checklist.

1. **Tourism Bureau alignment** — agreed roles, data sharing, public messaging with the Yosemite Mariposa County Tourism Bureau before FilmYosemite.com goes live. Non-negotiable per the spec.
2. **YFC 501(c)(3) status** — filed or in progress? Affects credential copy on the About page and grant eligibility.
3. **Location photography** — who shoots it, who owns the rights. Critical-path asset, not code.
4. **Mariposa County GIS access** — confirm with Ben Ogren (County GIS) whether we can rely on the county ArcGIS org for parcel data, or we're fully static in Phase 1.
5. **AFCI conflict-of-interest policy** — published vendor-inclusion criteria must be drafted *before* the Chamber import goes live, so KSG entities (Ignite Space, Frost Shop) are visibly treated on par with every other vendor.
6. **Next.js version truth** — reconcile docs with the actual Next 16 scaffold so future agents/humans don't build on the wrong mental model. *(Resolved: `CLAUDE.md` corrected.)*

## Sequencing

- **Week 1** — Schema + RLS + tenant seed; Figma → component mapping; Stockton Creek data ingest; Tourism Bureau + Ben Ogren meetings scheduled.
- **Week 2** — Homepage + Locations list/detail + map; Stockton Creek live as reference location.
- **Week 3** — Permits (two-track copy + PDF); Incentives (copy + PDF); About.
- **Week 4** — Vendors directory (Chamber import + filter UI); Plan Your Production intake form + email routing; polish + launch.

Read-only, static-authoritative, one-tenant, no AI, no auth — but with the multi-tenant schema and CivicOS-compatible data shape in place so Phase 2 doesn't require a rewrite.
