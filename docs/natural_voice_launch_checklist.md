# InterviewThread natural-voice production checklist

This checklist is the release gate for the interview-question read-aloud
feature. Do not publish the ElevenLabs path until every required item is
checked. The existing Azure/device path remains the safe production fallback.

## 1. Create or sign in to ElevenLabs

1. Open [ElevenLabs sign in](https://elevenlabs.io/app/sign-in).
2. Sign in with the account that will own InterviewThread production billing.
3. Turn on multi-factor authentication if the account settings offer it.
4. Do not paste an API key into chat, GitHub, a browser form on
   InterviewThread, or a `NEXT_PUBLIC_*` variable.

## 2. Confirm a commercially licensed plan

1. Review [ElevenLabs API pricing](https://elevenlabs.io/pricing/api).
2. Choose a paid plan that explicitly includes commercial use. The free plan
   is not a production option.
3. Before paying, confirm the account does not label `eleven_v3` as an alpha,
   beta, preview or other Beta Service. If it does, obtain written production
   permission from ElevenLabs before publishing.
4. Keep the receipt and the plan/terms snapshot with the project records.

No agent may purchase or change a recurring plan without the owner's explicit
approval of the amount and billing interval.

## 3. Select and audition voices

1. Open the [Voice Library](https://elevenlabs.io/app/voice-library).
2. For English, audition neutral professional female voices with
   conversational or narration use cases. Start with a short question, a long
   behavioral question and a technical question.
3. For every non-English locale, choose a native female voice for that locale.
   Do not reuse the English voice merely because the model can pronounce the
   language. `zh-CN` and `zh-TW` need separate reviewed voices, as does
   Brazilian Portuguese.
4. Test at least these content types:
   - a 10–15 word opening question;
   - a 40–60 word behavioral question;
   - names, dates, percentages and currency;
   - SQL, API, KPI, AWS, GCP, ETL, HR, AI, ML, BI, C++, C#, .NET and
     PostgreSQL.
5. Have a native or near-native reviewer score naturalness, accent,
   professionalism and technical pronunciation. Require an average of at
   least 4/5 and no wrong-language or meaning-changing pronunciation.
6. Record the approved voice ID for each locale. A missing non-English ID will
   deliberately fall back to Azure rather than use an English-accented voice.

The authoritative model/language list is in the
[ElevenLabs model documentation](https://elevenlabs.io/docs/overview/models).

## 4. Create a restricted production API key

1. Open [ElevenLabs API Keys](https://elevenlabs.io/app/developers/api-keys).
2. Create a new key named `InterviewThread production TTS`.
3. Allow only Text to Speech plus read-only Voice/Model access if the console
   requires it. Do not grant unrelated capabilities.
4. Set the smallest practical monthly credit quota and enable usage alerts.
5. Do not add an IP allowlist unless the production platform has a documented
   fixed outbound IP.
6. Copy the key once and save it directly into the encrypted Sites secret
   `ELEVENLABS_API_KEY`. Never save it in source control.

See the official [API key guidance](https://elevenlabs.io/docs/overview/administration/workspaces/api-keys).

## 5. Configure production without exposing secrets

Set these server-side Sites values:

- secret: `ELEVENLABS_API_KEY`
- config: `ELEVENLABS_VOICE_ID` (approved English baseline)
- config: `ELEVENLABS_VOICE_IDS_JSON` (approved native locale map)
- config: `TTS_DAILY_CHARACTER_LIMIT=50000` or a lower beta budget
- secret: `AZURE_SPEECH_KEY`
- config: `AZURE_SPEECH_REGION`
- secret/config as appropriate: `AZURE_SPEECH_ENDPOINT`
- config: `APP_RELEASE=<immutable Git commit>`

The code sends only the current question text and selected language to
ElevenLabs. Azure receives the same limited read-aloud data only on fallback.
Provider-side retention follows the provider account and privacy terms; the
site's `no-store` response cannot override provider retention.

## 6. Run the release tests

Before saving a Sites version:

```bash
npm run lint
npm test
git diff --check
```

Then make one real staging API request for at least `en`, `zh-TW`, `ja`, `ar`,
`fa` and `fil`. Confirm:

- HTTP 200 and `audio/mpeg`;
- `X-InterviewThread-Speech-Model: eleven_v3` for an approved locale;
- no key, question text, email, IP address or raw provider error in logs;
- an ElevenLabs 429/5xx/timeout safely reaches Azure;
- Azure failure safely reaches the device voice;
- oversized or wrong-MIME audio is rejected;
- the daily character ceiling returns 429 before calling a provider.

## 7. Canary and public release

1. Save an immutable Sites version from the exact tested Git commit.
2. Record the previous production version and environment revision.
3. Deploy to a private/canary URL first when available.
4. Test desktop Chrome/Safari, iOS Safari and Android Chrome: read, stop,
   replay, auto-read consent, rapid language switching and offline fallback.
5. Publish the tested version to `https://interviewthreadai.com`.
6. Monitor provider success, fallback rate, 429 rate and latency without
   logging question text.
7. Roll back both the Sites version and environment revision if speech success
   drops, costs spike, a privacy issue appears, or any P0/P1 defect is found.

## 8. User-facing verification links

- Live English site: <https://interviewthreadai.com/en>
- Traditional Chinese: <https://interviewthreadai.com/zh-tw>
- Interview workspace: <https://interviewthreadai.com/en#workspace>
- Privacy policy: <https://interviewthreadai.com/en/privacy>

