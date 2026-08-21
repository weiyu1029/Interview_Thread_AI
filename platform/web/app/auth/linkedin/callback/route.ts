import { GET as providerCallback } from "../../../api/auth/callback/[provider]/route";

export function GET(request: Request) {
  return providerCallback(request, {
    params: Promise.resolve({ provider: "linkedin" }),
  });
}
