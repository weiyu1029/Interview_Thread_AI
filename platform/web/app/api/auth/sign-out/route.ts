import { safeReturnPath } from "../../../auth-paths";
import {
  AUTH_SESSION_COOKIE,
  clearSessionCookie,
  cookieValue,
  hashSessionToken,
} from "../../../oauth-security";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const returnTo = safeReturnPath(requestUrl.searchParams.get("return_to"));
  const token = cookieValue(
    request.headers.get("cookie"),
    AUTH_SESSION_COOKIE,
  );
  if (token) {
    try {
      const { deleteAuthSession } = await import("../../../../db");
      await deleteAuthSession(await hashSessionToken(token));
    } catch (error) {
      console.error("Account sign-out cleanup failed", error);
    }
  }

  const response = new Response(null, {
    status: 302,
    headers: {
      Location: new URL(returnTo, request.url).toString(),
      "Cache-Control": "no-store",
    },
  });
  response.headers.append(
    "Set-Cookie",
    clearSessionCookie(requestUrl.protocol === "https:"),
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
