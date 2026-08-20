# Model Provider Strategy

InterviewThread supports model runtimes rather than promising a permanently current
list of every model name. Model catalogs, licenses, hardware requirements, and
host availability change continuously. Runtime discovery is more accurate and
more maintainable than a hard-coded list.

## Built-in adapters

| Provider | Typical use | Model coverage |
|---|---|---|
| InterviewThread Evidence Engine | No-key baseline | Deterministic analysis only |
| Ollama | Local desktop or self-hosted | Any installed chat model |
| LM Studio | Local desktop | Any loaded compatible chat model |
| vLLM | Production self-hosting | Any model served by the configured instance |
| llama.cpp | Local GGUF inference | Any compatible server-loaded chat model |
| LocalAI | Self-hosted multi-backend runtime | Any configured compatible model |
| Hugging Face Inference Providers | Hosted open/open-weight models | Models returned by the provider catalog |
| Gemini | Existing optional InterviewThread workflow | Configured Gemini models |

Ollama, LM Studio, vLLM, llama.cpp, LocalAI, and Hugging Face provide
OpenAI-compatible chat interfaces, so InterviewThread uses one reviewed adapter for
the common request and response contract:

- [Ollama OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility)
- [LM Studio compatibility endpoints](https://lmstudio.ai/docs/developer/openai-compat)
- [vLLM OpenAI-compatible server](https://docs.vllm.ai/en/latest/getting_started/quickstart/)
- [llama.cpp server](https://github.com/ggml-org/llama.cpp/tree/master/tools/server)
- [LocalAI documentation](https://localai.io/docs/)
- [Hugging Face Inference Providers](https://huggingface.co/docs/inference-providers/en/index)

Administrators can add another compatible service through
`CAREERPROOF_PROVIDER_CONFIG_JSON`. Browser requests cannot submit an arbitrary
base URL. This prevents an attacker from using the public API to probe internal
network services.

## Model selection rules

Model names are discovered from `/v1/models` where the provider supports it.
The UI may also accept a model identifier known to the administrator. A model is
not marked "open source" solely because its weights can be downloaded; the
project should display the upstream license and usage terms before recommending
a model for commercial use.

InterviewThread quality depends more on behavior than brand. Production models
should be evaluated for:

- evidence precision and unsupported-claim rate;
- structured-output reliability;
- instruction and prompt-injection resistance;
- multilingual resume and job-description performance;
- latency, context length, and total cost;
- license compatibility and data-processing terms.

## Key handling

User-supplied provider keys are sent in the ephemeral
`X-Model-Api-Key` header. They are never included in analysis records, usage
properties, chat content, or logs. Hosted deployments should redact this header
at the reverse proxy and application-observability layers.

