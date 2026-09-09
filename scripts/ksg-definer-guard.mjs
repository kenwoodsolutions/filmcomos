#!/usr/bin/env node
/**
 * ksg-definer-guard — static guard on SECURITY DEFINER function grants.
 *
 * Why this exists
 * ---------------
 * Postgres grants EXECUTE to PUBLIC on every newly created function, and
 * Supabase's `anon` role inherits PUBLIC. A `revoke execute ... from anon`
 * is therefore a no-op — the inherited PUBLIC grant survives it. The only
 * correct pattern is:
 *
 *   revoke execute on function public.fn(args) from public, anon, authenticated;
 *   grant  execute on function public.fn(args) to authenticated;  -- if intended
 *
 * This guard reads migration files only. It needs no database credentials,
 * so it runs in CI on a fork PR.
 *
 * A function passes if either:
 *   1. some migration revokes EXECUTE on it from `public`, or
 *   2. it is listed in scripts/definer-guard-baseline.json (pre-existing).
 *
 * The baseline is a debt ledger, not an approval. New SECURITY DEFINER
 * functions must revoke; adding to the baseline is a reviewed exception.
 *
 * CANONICAL SOURCE: ksg-control/scripts/ksg-definer-guard.mjs
 * Copies in product repos are exactly that -- copies. Fix bugs here first,
 * then propagate. See ksg-control/standards/ksg-security-definer-grants.md.
 *
 * Usage:
 *   node scripts/ksg-definer-guard.mjs                 check; exit 1 on violation
 *   node scripts/ksg-definer-guard.mjs --json          machine-readable
 *   node scripts/ksg-definer-guard.mjs --seed-baseline (re)write the baseline
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIG_DIR = path.join(ROOT, "supabase", "migrations");
const BASELINE_PATH = path.join(ROOT, "scripts", "definer-guard-baseline.json");

const CREATE_FN =
  /create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?"?([a-z0-9_]+)"?\s*\(/gi;
const DROP_FN = /drop\s+function\s+(?:if\s+exists\s+)?(?:public\.)?"?([a-z0-9_]+)"?/gi;

/** Does `sql` revoke EXECUTE on `fn` from PUBLIC (not merely from anon)? */
function revokesFromPublic(sql, fn) {
  // Match the target function anywhere in a (possibly comma-separated) function
  // list within one revoke statement. Only the first function follows the literal
  // `on function` token, so `[^;]*?` is what lets us see b() and c() in
  // `revoke ... on function a(), b(), c() from public`. The `[^;]` bound keeps the
  // match inside a single statement, and the required `(` after the name stops it
  // matching a role name in the `from` clause.
  //
  // The lookbehind is load-bearing. Without it that same `[^;]*?` also skips an
  // identifier prefix, so `foo` would match inside `my_foo()` or `other.foo()` and
  // report an unguarded SECURITY DEFINER function as revoked from PUBLIC. For a
  // guard, a false "safe" is far worse than a false alarm.
  const re = new RegExp(
    `revoke\\s+(?:all|execute)[^;]*?\\bon\\s+function\\s+[^;]*?(?<![a-z0-9_.])(?:public\\.)?"?${fn}"?\\s*\\([^;]*?\\bfrom\\b[^;]*?\\bpublic\\b`,
    "is",
  );
  return re.test(sql);
}

function migrationFiles() {
  // Safe to install in every repo, including ones with no Supabase at all --
  // a repo with no migrations has nothing to guard and must not fail CI.
  if (!existsSync(MIG_DIR)) return [];
  return readdirSync(MIG_DIR).filter((f) => f.endsWith(".sql")).sort();
}

function scan() {
  const files = migrationFiles();
  /** name -> { defined: [file], definer: bool, revokedIn: file|null, droppedAfterRevoke: bool } */
  const fns = new Map();

  for (const file of files) {
    const sql = readFileSync(path.join(MIG_DIR, file), "utf8");

    // Locate every create-function and decide if that definition is DEFINER
    // by slicing to the start of the next create-function in the same file.
    const creates = [...sql.matchAll(CREATE_FN)];
    creates.forEach((m, i) => {
      const start = m.index;
      const end = i + 1 < creates.length ? creates[i + 1].index : sql.length;
      const body = sql.slice(start, end);
      if (!/security\s+definer/i.test(body)) return;
      const name = m[1].toLowerCase();
      if (!fns.has(name)) {
        fns.set(name, { name, definedIn: [], revokedIn: null, droppedAfterRevoke: false });
      }
      fns.get(name).definedIn.push(file);
    });

    // Revokes and drops are scanned across the whole file.
    for (const [name, rec] of fns) {
      if (revokesFromPublic(sql, name)) {
        rec.revokedIn = file;
        rec.droppedAfterRevoke = false;
      }
    }
    for (const m of sql.matchAll(DROP_FN)) {
      const rec = fns.get(m[1].toLowerCase());
      if (rec && rec.revokedIn && file > rec.revokedIn) rec.droppedAfterRevoke = true;
    }
  }
  return fns;
}

function loadBaseline() {
  if (!existsSync(BASELINE_PATH)) return { functions: {} };
  return JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
}

const fns = scan();
const unguarded = [...fns.values()].filter(
  (r) => !r.revokedIn || r.droppedAfterRevoke,
);

if (process.argv.includes("--seed-baseline")) {
  const functions = {};
  for (const r of unguarded.sort((a, b) => a.name.localeCompare(b.name))) {
    functions[r.name] = {
      first_defined_in: r.definedIn[0],
      note: "pre-existing at baseline; not yet converted to revoke-from-public",
    };
  }
  const out = {
    generated: new Date().toISOString().slice(0, 10),
    why:
      "Debt ledger for SECURITY DEFINER functions that predate the guard. " +
      "Entries here are NOT approved — they are known and unreviewed unless " +
      "marked reviewed. New functions must revoke EXECUTE from public.",
    count: Object.keys(functions).length,
    functions,
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`definer-guard: seeded baseline with ${out.count} functions`);
  process.exit(0);
}

const baseline = loadBaseline();
const violations = unguarded.filter((r) => !(r.name in baseline.functions));
const summary = {
  migrations: migrationFiles().length,
  definer_functions: fns.size,
  baselined: Object.keys(baseline.functions).length,
  unguarded: unguarded.length,
  new_violations: violations.length,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ ...summary, violations: violations.map((v) => v.name) }, null, 2));
} else {
  console.log(
    `definer-guard: ${summary.migrations} migrations · ` +
      `${summary.definer_functions} SECURITY DEFINER definitions · ` +
      `${summary.baselined} baselined · ${summary.new_violations} new violations`,
  );
  for (const v of violations) {
    console.error(
      `\n  ✗ ${v.name}  (defined in ${v.definedIn[v.definedIn.length - 1]})\n` +
        `    SECURITY DEFINER with no revoke from PUBLIC. Add to the migration:\n` +
        `      revoke execute on function public.${v.name}(<args>) from public, anon, authenticated;\n` +
        `      grant  execute on function public.${v.name}(<args>) to authenticated;  -- only if intended`,
    );
  }
}

process.exit(violations.length > 0 ? 1 : 0);
