# CareerStoryMap voice interview architecture

## Product contract

Interview Studio must keep the displayed question, speech output, speech input,
and generated follow-up in the locale selected by the user. A saved session from
another locale is never resumed. The system must never invent an achievement;
every topic comes from resume evidence, an identified gap, or a clearly labeled
case prompt.

The current open-source experience works without an API key:

- Questions progress through context, ownership, decision, outcome, and
  reflection.
- Submitting an answer immediately generates the next question.
- After reflection, the engine moves to the next evidence topic.
- The user can skip to the next follow-up or start a new topic at any time.
- Browser speech synthesis chooses the best installed voice for the exact BCP 47
  locale, and browser speech recognition is locked to the same locale.
- The displayed question remains unchanged; a separate speech-normalization
  layer expands abbreviations such as SQL, API, KPI, CEO, COO, HR, and JD.

## Recommended hosted voice stack

For a future hosted precision mode, use `gpt-realtime-1.5` for the live
audio-in/audio-out interview and `GPT Transcribe` for a high-accuracy transcript
that can be rescored after each answer. OpenAI currently describes
`gpt-realtime-1.5` as its flagship audio model for voice agents and GPT
Transcribe as its high-accuracy speech-to-text model.

Official references:

- <https://developers.openai.com/api/docs/models/gpt-realtime-1.5>
- <https://developers.openai.com/api/docs/models/all>
- <https://developers.openai.com/api/docs/guides/realtime>
- <https://developers.openai.com/api/docs/guides/speech-to-text>

Do not put an OpenAI API key in browser code. The server should mint a short-lived
Realtime client secret, apply per-user rate limits, and log only operational
metadata by default. Raw audio and transcripts require explicit consent and a
documented retention setting.

## Accuracy and evaluation

No speech system can honestly promise 100% recognition or pronunciation across
every speaker, device, accent, name, and technical term. Production readiness is
therefore measured with a versioned evaluation set for all 40 locales:

1. Native-speaker recordings across quiet, office, and mobile-noise conditions.
2. Technical vocabulary and company or person names supplied by the user.
3. Word error rate, proper-noun accuracy, abbreviation accuracy, and end-to-end
   response latency.
4. Human ratings for pronunciation, naturalness, question relevance, and whether
   each follow-up is supported by evidence.
5. Regression gates by locale, browser, operating system, and microphone class.

The UI must always provide text editing before submission, show the active speech
locale, and preserve a text-only fallback when a browser or model is unavailable.
