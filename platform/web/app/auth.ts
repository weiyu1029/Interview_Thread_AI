import { cookies } from "next/headers";
import { getChatGPTUser } from "./chatgpt-auth";
import {
  AUTH_SESSION_COOKIE,
  hashSessionToken,
} from "./oauth-security";
import type { OAuthProvider } from "./oauth-providers";

export type AppUser = {
  userId: string;
  displayName: string;
  email: string | null;
  provider: OAuthProvider | "sites";
  avatarUrl: string | null;
  providerUsername: string | null;
  providerProfileUrl: string | null;
};

export async function getAppUser(): Promise<AppUser | null> {
  const sitesUser = await getChatGPTUser();
  if (sitesUser) {
    return {
      userId: sitesUser.userId,
      displayName: sitesUser.displayName,
      email: sitesUser.email,
      provider: "sites",
      avatarUrl: null,
      providerUsername: null,
      providerProfileUrl: null,
    };
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  try {
    const { findUserBySession } = await import("../db");
    return await findUserBySession(await hashSessionToken(sessionToken));
  } catch (error) {
    console.error("Account session lookup failed", error);
    return null;
  }
}
