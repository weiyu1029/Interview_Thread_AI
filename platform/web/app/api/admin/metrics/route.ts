import { getAdminProductMetrics } from "../../../../db";
import { isAdminEmail } from "../../../admin-access";
import { getAppUser } from "../../../auth";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

export async function GET() {
  const user = await getAppUser();
  if (!user)
    return Response.json(
      { error: "Sign in is required." },
      { status: 401, headers: PRIVATE_HEADERS },
    );
  if (!isAdminEmail(user.email))
    return Response.json(
      { error: "Not found." },
      { status: 404, headers: PRIVATE_HEADERS },
    );

  try {
    const metrics = await getAdminProductMetrics();
    return Response.json(metrics, { headers: PRIVATE_HEADERS });
  } catch {
    return Response.json(
      { error: "Operational metrics are temporarily unavailable." },
      { status: 503, headers: PRIVATE_HEADERS },
    );
  }
}

