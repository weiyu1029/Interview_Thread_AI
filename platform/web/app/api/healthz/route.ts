import { runHealthCheck } from "../../health.ts";

export async function GET() {
  const { env } = await import("cloudflare:workers");
  return runHealthCheck(env.DB);
}
