const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://interviewthreadai.com";

export function GET() {
  const body = `# InterviewThread authentication

InterviewThread supports interactive user sign-in through Google, GitHub, and LinkedIn. Sign-in is optional for trying the core workspace; it is required only when a feature needs to save account-linked activity.

## Interactive sign-in

- Account page: ${SITE_URL}/en/account
- Providers: Google, GitHub, and LinkedIn
- Authentication: OAuth authorization-code flow initiated in the user's browser
- Session: secure, HTTP-only, same-site cookie
- Sign-out: ${SITE_URL}/api/auth/sign-out

The user must choose a provider and complete that provider's consent screen. InterviewThread requests basic identity fields used to create the account session: display name, email address when the provider supplies it, and profile image. LinkedIn career history is not imported automatically.

## Agent and API access

- Public read-only endpoints listed in ${SITE_URL}/.well-known/api-catalog do not require authentication.
- InterviewThread does not currently issue public API keys, bearer tokens, service accounts, or dynamic OAuth clients.
- Account activity, beta records, and feedback endpoints use the signed-in user's browser session and are not offered as autonomous-agent APIs.
- External agents must not attempt to reuse a person's browser cookie or bypass the provider consent flow.

## User control and data handling

- A user can try the workspace without signing in, but guest activity is not saved to an account.
- Uploaded resumes, job descriptions, interview transcripts, and voice recordings are not automatically imported from third-party profiles.
- A user chooses what to provide and which optional links to share.
- Privacy policy: ${SITE_URL}/en/privacy
- Terms of service: ${SITE_URL}/en/terms
- Security reports: https://github.com/weiyu1029/Interview_Thread_AI/security/policy
- Support: contact@interviewthreadai.com

## Future delegated access

If InterviewThread later offers delegated API access for AI agents, this document and the API catalog will be updated with the authorization server, scopes, token audience, revocation method, and consent requirements. Until then, no machine-to-machine or delegated-agent authentication is supported.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
