# FilmComOS — Project CLAUDE.md

> ## 🔒 READ FIRST — KSG operating rules live upstream, not in this file
>
> 1. **Notion is the source of truth.** Canonical rule page: **"🔒 CANONICAL: KSG System of Record — Storage & Source of Truth Rule"** → Notion `3bfa27745fa981f3bf12da8fd487377f`
> **Standards are required, not advisory.** Load 🧭 CANONICAL: KSG Standards Register — The One Door (Notion `3c0a27745fa98181ae66e3ce4b363c3c`) — the single index to all 22 locked KSG standards. Reference that page only.
> 2. **🗺️ THE MAP — "KSG Source-of-Truth Index"** → Notion database `60d8cbd5e1cc4b1999cca90667f7bffe`. Every platform's repo, host, local path, prod, Supabase ref, Notion workspace, and applicable standards. *(Replaces the old ~~`Xav Master Control/KSG Source-of-Truth Index (2026-07-13).md`~~ **(this file never existed on disk — superseded by the Notion Index above)**, which never existed on disk.)*
> 3. **Ecosystem root:** `github.com/xav-ksg/ksg-control` → `CLAUDE.md` (local: `~/Developer/ksg-control/CLAUDE.md`). Authorization posture, DEPLOY MODE, concurrency, cross-platform rules.
>
> Everything below this block is repo-specific. Where it conflicts with the above, **the above wins.**

## Non-negotiables (summary — full text in the ecosystem root)

- **Secrets:** 1Password Kenwood vault only. Never in this repo, Drive, Notion, chat, or a downloaded JSON. `.env*` stays gitignored.
- **Concurrency — one WRITER per working tree.** Unlimited parallel readers/reviewers/testers. Parallel writers each get their own `git worktree`. Never two writers in the same tree. Worktrees isolate code, *not* data — a shared Supabase project still collides.
- **DEPLOY MODE:** production deploys are gated *unless* Xav has said "DEPLOY MODE ON" this session. When ON, announce-then-execute — never ask. Always gated regardless: destructive migrations, data deletion, DNS, secret rotation, money movement, external comms.
- **Never deploy an edge function without diffing deployed-vs-repo first.** This has already caught two uncommitted production features.
- **Cross-platform:** MacBook Pro M5 (primary) + Dell XPS 15 / Win 11. No hardcoded absolute paths. lowercase-kebab filenames. `.gitattributes` with `eol=lf` is mandatory — never remove it.
- **Canonical names:** FilmComOS (not "FilmOS") · CivicHub360 (CH360) · YourEventsHub (YEH) · Frost Shop Marketplace (FSM) · GrantsOS.
- **Lovable is PROHIBITED.** No account exists. Never connect, reference, or reintroduce it.

---

# FilmComOS

Film Commission Operating System — piloting at Yosemite Film Commission (YFC),
designed to be white-labeled for global film commissions worldwide.

> **🗺️ Source-of-truth map — READ FIRST (any KSG repo):** ~~`Xav Master Control/KSG Source-of-Truth Index (2026-07-13).md`~~ **(this file never existed on disk — superseded by the Notion Index above)** — every KSG platform's repo, prod, DB, canonical spec, build-state doc, Notion mirror, and which shared standards apply. **This repo = FilmComOS** (`filmcomos`, Next.js 16, Supabase, prod from `main`). Current build-state lives in **git history + the product spec below** — there is no in-repo RESUME doc yet. **FSM (`xav-ksg/frost-shop`) is the KSG reference implementation** — its security patterns already applied here (Watchtower Layer A); its form-guard / Turnstile (flag-gated) / Frosty / email-design patterns are fork-ready when relevant. KSG entities (Ignite Space, Frost Shop, etc.) must appear on par with every other vendor in FilmComOS.

> **Family standards:** load the relevant KSG shared standard before building the thing it governs (Platform Harmony, Email Design, Search Everywhere, UI-UX, Compliance Partnership, Two-Way Comms, Scale-Trigger). Exact locations are in the Source-of-Truth Index §3.

## Primary Reference

See the full product specification at:
[./docs/FilmComOS_YFC_Product_Spec_v2.docx](./docs/FilmComOS_YFC_Product_Spec_v2.docx) *(renamed 2026-08-31 — the file previously carried the retired "FilmOS" name.)*
Phase-1 scope + blockers: [./docs/phase-1-scope.md](./docs/phase-1-scope.md) · [./docs/phase-1-blockers.md](./docs/phase-1-blockers.md)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **Hosting:** Vercel
- **AI:** Claude API
- **Mobile:** React Native / Expo

## Ownership

Kenwood Solutions Group (KSG). Founder and operator: Xav Dubois (xav@kenwoodsolutions.com).

## UI Design Standard (global — all KSG platforms: FSM, CH360, YEH, GrantsOS, etc.)
- **Dirty-save rule (Xav 2026-07-31):** Every Save/Update button on an edit form MUST look flat/dimmed and disabled until the form actually has unsaved changes, then light up (primary color) once dirty. An active-looking Save on a clean form misleads users into thinking something needs saving. Create/action buttons (Add, Publish, Send, Approve…) stay active — the rule is for saving *changes* to an existing record. Reference implementation: frost-shop `app/components/DirtySaveButton.tsx`.

*CLAUDE.md parity pass 2026-08-26 — canonical-name rule repaired; GrantsOS; Standards Register added.*
