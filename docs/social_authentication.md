# Social authentication

InterviewThread supports account sign-in with Google, GitHub, and LinkedIn. The
application uses OAuth 2.0 Authorization Code flow with PKCE, a signed and
short-lived state cookie, and an opaque HttpOnly session cookie. Access and
refresh tokens are discarded after the app reads the provider's identity
response; they are not stored in D1.

## Data boundary

Sign-in is identity only. The app stores the provider's stable account ID,
display name, verified email when available, profile image URL, and—on
GitHub—the public username and profile URL. Signing in does not automatically
import a LinkedIn profile, GitHub repositories, a portfolio, a resume, a job
description, an interview transcript, or voice audio. A user must separately
choose any career source that should become interview evidence.

The requested scopes are deliberately narrow:

| Provider | Scopes | Purpose |
| --- | --- | --- |
| Google | `openid email profile` | Name, verified email, profile image |
| GitHub | `read:user user:email` | Public profile and a verified email when available |
| LinkedIn | `openid profile email` | Lite profile through LinkedIn OpenID Connect |

## Provider setup

Create separate development and production OAuth applications whenever the
provider supports it. Provider secrets must be stored as local `.dev.vars` or
as encrypted hosting secrets, never in Git or public client-side variables.

Set these runtime values:

```text
AUTH_SECRET=<at least 32 cryptographically random characters>
APP_BASE_URL=https://interviewthreadai.com
GOOGLE_CLIENT_ID=<provider value>
GOOGLE_CLIENT_SECRET=<provider value>
GITHUB_CLIENT_ID=<provider value>
GITHUB_CLIENT_SECRET=<provider value>
LINKEDIN_CLIENT_ID=<provider value>
LINKEDIN_CLIENT_SECRET=<provider value>
```

Register the exact production callback URLs:

```text
https://interviewthreadai.com/api/auth/callback/google
https://interviewthreadai.com/api/auth/callback/github
https://interviewthreadai.com/api/auth/callback/linkedin
```

### LinkedIn dashboard: callback URL versus scopes

On LinkedIn's **Auth** page, the OAuth 2.0 redirect URL list accepts callback
URLs only. Do not try to add `openid`, `profile`, or `email` in that list; those
values are OAuth scopes, not redirect URLs.

1. Under **OAuth 2.0 settings**, add this exact redirect URL:

   ```text
   https://interviewthreadai.com/api/auth/callback/linkedin
   ```

2. Select **Update** and confirm that the URL appears in the saved list.
3. Confirm that the LinkedIn application has the **Sign In with LinkedIn using
   OpenID Connect** product enabled.
4. Start a LinkedIn sign-in from InterviewThread and inspect the authorization
   request if troubleshooting is necessary. The application requests:

   ```text
   scope=openid%20profile%20email
   ```

   The unencoded value is `openid profile email`. InterviewThread adds this
   parameter automatically when it starts OAuth; it is not entered manually in
   the LinkedIn dashboard.
5. If LinkedIn reports that `redirect_uri` does not match the registered value,
   compare the complete URL character for character, including `https`, the
   domain, path, and absence of a trailing slash. After saving the corrected
   callback, test **Continue securely · LinkedIn** again.

For local development on port 3001, use the matching callbacks:

```text
http://localhost:3001/api/auth/callback/google
http://localhost:3001/api/auth/callback/github
http://localhost:3001/api/auth/callback/linkedin
```

If a different local port is used, both `APP_BASE_URL` and the registered
callback must use that exact origin. Google requires an OAuth web client.
LinkedIn also requires the application to have the **Sign In with LinkedIn
using OpenID Connect** product approved. GitHub should use a separate OAuth App
for local development because an OAuth App has a single configured callback
URL.

Copy `platform/web/.dev.vars.example` to `platform/web/.dev.vars` and add local
development credentials there. The account page stays functional when a
provider is not configured: it reports the missing one-time setup instead of
opening a nonexistent route.

## Session and storage design

- OAuth state expires after ten minutes and is HMAC-signed.
- PKCE uses `S256`.
- Session cookies are `HttpOnly`, `SameSite=Lax`, host-only, and `Secure` on
  HTTPS.
- Only a SHA-256 hash of the 30-day session token is stored in D1.
- Provider accounts are not silently linked by matching email. That avoids
  account-takeover risk when provider email behavior differs.
- Authentication is rechecked in account-owned API routes.

Before production activation, add the three provider secrets to the deployed
Sites environment, publish the privacy policy and terms pages required by the
providers, and complete each provider's consent-screen review.
