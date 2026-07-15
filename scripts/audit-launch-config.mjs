const checks = [
  ["NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL, (value) => /^https:\/\//.test(value)],
  ["NEXT_PUBLIC_SUPPORT_EMAIL", process.env.NEXT_PUBLIC_SUPPORT_EMAIL, (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !value.includes("your-domain")],
  ["NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL, (value) => /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(value) && !value.includes("your-project")],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, (value) => value.length > 40 && !value.includes("your-supabase")]
];

let failed = false;
for (const [name, rawValue, validate] of checks) {
  const value = rawValue?.trim() || "";
  const valid = Boolean(value && validate(value));
  console.log(`${valid ? "PASS" : "FAIL"} ${name}`);
  failed ||= !valid;
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log("WARN SUPABASE_SERVICE_ROLE_KEY is not used by the app and should be removed from the deployment.");
}

if (failed) {
  console.error("\nLaunch configuration is incomplete.");
  process.exit(1);
}

console.log("\nLaunch configuration is ready for a live health check.");
