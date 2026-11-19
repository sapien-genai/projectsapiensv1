import { supabase } from "../../lib/supabase";
import type { Report } from "../../../supabase/functions/visibility-report/core/types";
import type {
  Question,
  StudyAnswer,
} from "../../../supabase/functions/visibility-report/core/studies";
export type Product = "fix" | "tracking";
export type Price = {
  enabled: boolean;
  amount: number;
  currency: string;
  interval: string | null;
};
export type BusinessProfile = { business_name: string; location: string; industry: string; employees: string; goal: string };
export type Project = {
  report_id?: string;
  business_profile?: BusinessProfile | null;
  id: string;
  domain: string;
  business_name: string;
  report: Report;
  questions: Question[];
};
export type Order = {
  id: string;
  project_id: string;
  product: Product;
  status: string;
  paid_until: string | null;
  cancel_at_period_end: boolean;
};
export type Job = {
  id: string;
  project_id: string;
  kind: Product;
  status: string;
  created_at: string;
  questions: Question[];
  config: Record<string, unknown>;
  result: { markdown: string } | null;
};
export type Task = StudyAnswer & { job_id: string };
export type Dashboard = {
  projects: Project[];
  orders: Order[];
  jobs: Job[];
  tasks: Task[];
  changes: {
    id: string;
    project_id: string;
    note: string;
    created_at: string;
  }[];
  catalog: Record<Product, Price | null>;
};
export async function customerApi<T>(
  body: Record<string, unknown>,
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visibility-customer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${
          session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY
        }`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "We could not connect. Please try again.");
  }
  return result;
}
export const priceLabel = (p: Price | null | undefined) =>
  p
    ? `${
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: p.currency,
        maximumFractionDigits: 2,
      }).format(p.amount / 100)
    }${p.interval ? " / month" : ""}`
    : "Pricing opens soon";
export const dashboardPath = "/ai-visibility/dashboard/";
export function download(name: string, text: string, type = "text/markdown") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
