export function businessProfile(value: unknown): Record<string, string> {
  const input = value as Record<string, unknown>;

  const limits: Record<string, number> = { business_name: 120, location: 160, industry: 120, employees: 30, goal: 600 };
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Enter your business details.");
  const profile: Record<string, string> = {};
  for (const [key, max] of Object.entries(limits)) {
    if (typeof input[key] !== "string" || !input[key].trim() || input[key].trim().length > max) throw new Error("Complete each business field within its length limit.");
    profile[key] = input[key].trim();
  }
  if (!["Just me", "2–10", "11–50", "51–200", "201–500", "501+", "Prefer not to say"].includes(profile.employees)) throw new Error("Choose an employee range.");
  return profile;
}
