import json
import re
from typing import Any

import httpx
from google import genai
from google.genai import types

from app.core.config import settings


class LLMUnavailableError(RuntimeError):
    pass


class LLMClient:
    """Gemini-first client with Ollama fallback. Calls are synchronous by design."""

    def __init__(self) -> None:
        self.provider_used: str | None = None

    def generate(self, prompt: str, *, system_instruction: str | None = None, temperature: float = 0.2) -> str:
        errors: list[str] = []

        if settings.gemini_api_key:
            try:
                client = genai.Client(api_key=settings.gemini_api_key)
                config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=temperature,
                )
                response = client.models.generate_content(
                    model=settings.gemini_model,
                    contents=prompt,
                    config=config,
                )
                if response.text:
                    self.provider_used = "gemini"
                    return response.text.strip()
                errors.append("Gemini retornou uma resposta vazia.")
            except Exception as exc:  # fallback must also cover provider/network errors
                errors.append(f"Gemini: {exc.__class__.__name__}: {exc}")

        try:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            response = httpx.post(
                f"{settings.ollama_base_url.rstrip('/')}/api/chat",
                json={
                    "model": settings.ollama_model,
                    "messages": messages,
                    "stream": False,
                    "options": {"temperature": temperature},
                },
                timeout=180.0,
            )
            response.raise_for_status()
            content = response.json().get("message", {}).get("content", "").strip()
            if not content:
                raise ValueError("Ollama retornou uma resposta vazia.")
            self.provider_used = "ollama"
            return content
        except Exception as exc:
            errors.append(f"Ollama: {exc.__class__.__name__}: {exc}")

        raise LLMUnavailableError("Nenhum provedor de LLM disponível. " + " | ".join(errors))

    def generate_json(
        self,
        prompt: str,
        *,
        system_instruction: str | None = None,
        temperature: float = 0.1,
    ) -> dict[str, Any]:
        raw = self.generate(prompt, system_instruction=system_instruction, temperature=temperature)
        return parse_json_object(raw)


def parse_json_object(text: str) -> dict[str, Any]:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE)
    try:
        value = json.loads(cleaned)
    except json.JSONDecodeError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("A resposta do modelo não contém um objeto JSON válido.")
        value = json.loads(cleaned[start : end + 1])
    if not isinstance(value, dict):
        raise ValueError("A resposta JSON precisa ser um objeto.")
    return value
