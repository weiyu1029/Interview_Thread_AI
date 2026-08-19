from __future__ import annotations

import json
from dataclasses import asdict, dataclass

import httpx

from .config import get_settings


@dataclass(frozen=True)
class ProviderDefinition:
    id: str
    name: str
    kind: str
    base_url: str | None
    requires_key: bool
    local: bool
    discoverable: bool
    default_models: tuple[str, ...]
    note: str


DEFAULT_PROVIDERS = (
    ProviderDefinition(
        "deterministic", "CareerProof Evidence Engine", "deterministic", None, False, True, False,
        ("evidence-engine-v1",), "Transparent scoring and story scaffolds without an external model.",
    ),
    ProviderDefinition(
        "ollama", "Ollama", "openai-compatible", "http://host.docker.internal:11434/v1", False, True, True,
        ("qwen3:8b", "gemma3:12b", "deepseek-r1:8b"), "Use any chat model installed in your Ollama library.",
    ),
    ProviderDefinition(
        "lm-studio", "LM Studio", "openai-compatible", "http://host.docker.internal:1234/v1", False, True, True,
        ("local-model",), "Use the identifier of any model loaded in LM Studio.",
    ),
    ProviderDefinition(
        "vllm", "vLLM", "openai-compatible", "http://host.docker.internal:8000/v1", False, True, True,
        ("served-model",), "Use any model exposed by your vLLM server.",
    ),
    ProviderDefinition(
        "llama-cpp", "llama.cpp", "openai-compatible", "http://host.docker.internal:8080/v1", False, True, True,
        ("local-model",), "Use any supported GGUF chat model exposed by llama-server.",
    ),
    ProviderDefinition(
        "localai", "LocalAI", "openai-compatible", "http://host.docker.internal:8080/v1", False, True, True,
        ("local-model",), "Use any model configured in your LocalAI instance.",
    ),
    ProviderDefinition(
        "huggingface", "Hugging Face Inference Providers", "openai-compatible", "https://router.huggingface.co/v1", True, False, True,
        ("openai/gpt-oss-120b:fastest", "Qwen/Qwen3-32B", "deepseek-ai/DeepSeek-R1"), "Routes supported open and open-weight chat models with a user token.",
    ),
    ProviderDefinition(
        "gemini", "Google Gemini", "gemini", None, True, False, False,
        ("gemini-2.5-flash",), "Optional hosted provider retained for existing CareerProof users.",
    ),
)


def provider_registry() -> dict[str, ProviderDefinition]:
    registry = {item.id: item for item in DEFAULT_PROVIDERS}
    try:
        custom = json.loads(get_settings().provider_config_json)
    except json.JSONDecodeError:
        custom = {}
    for provider_id, value in custom.items():
        if not isinstance(value, dict) or not value.get("base_url"):
            continue
        registry[provider_id] = ProviderDefinition(
            id=provider_id,
            name=str(value.get("name", provider_id)),
            kind="openai-compatible",
            base_url=str(value["base_url"]).rstrip("/"),
            requires_key=bool(value.get("requires_key", True)),
            local=bool(value.get("local", False)),
            discoverable=True,
            default_models=tuple(value.get("default_models", ["configured-model"])),
            note=str(value.get("note", "Administrator-configured compatible provider.")),
        )
    return registry


def public_provider_catalog() -> list[dict]:
    return [asdict(item) for item in provider_registry().values()]


async def discover_models(provider_id: str, api_key: str | None) -> list[str]:
    provider = provider_registry().get(provider_id)
    if not provider or not provider.discoverable or not provider.base_url:
        return list(provider.default_models) if provider else []
    if provider.requires_key and not api_key:
        return list(provider.default_models)
    headers = {"Authorization": f"Bearer {api_key or 'local'}"}
    async with httpx.AsyncClient(timeout=8.0) as client:
        response = await client.get(f"{provider.base_url}/models", headers=headers)
        response.raise_for_status()
        payload = response.json()
    return [str(item["id"]) for item in payload.get("data", []) if item.get("id")]


async def generate_text(
    provider_id: str,
    model: str,
    messages: list[dict[str, str]],
    api_key: str | None,
) -> str | None:
    provider = provider_registry().get(provider_id)
    if not provider:
        raise ValueError("Unknown model provider")
    if provider.kind == "deterministic":
        return None
    if provider.requires_key and not api_key:
        raise ValueError(f"{provider.name} requires an API key")
    if provider.kind == "gemini":
        from google import genai

        client = genai.Client(api_key=api_key)
        prompt = "\n\n".join(f"{item['role'].upper()}: {item['content']}" for item in messages)
        response = client.models.generate_content(model=model, contents=prompt)
        return response.text or ""
    if not provider.base_url:
        raise ValueError("Provider is missing a server URL")
    headers = {"Authorization": f"Bearer {api_key or 'local'}", "Content-Type": "application/json"}
    payload = {"model": model, "messages": messages, "temperature": 0.2, "max_tokens": 1800}
    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(f"{provider.base_url}/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        body = response.json()
    return str(body["choices"][0]["message"]["content"])

