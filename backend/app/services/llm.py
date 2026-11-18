import base64
import json
import re
import subprocess
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

    def transcribe_audio(self, audio: bytes, mime_type: str) -> str:
        """Try Gemini first, then a local audio-capable Ollama model."""
        errors: list[str] = []
        if settings.gemini_api_key:
            try:
                client = genai.Client(api_key=settings.gemini_api_key)
                response = client.models.generate_content(
                    model=settings.gemini_model,
                    contents=[
                        types.Part.from_bytes(data=audio, mime_type=mime_type),
                        "Transcreva integralmente este áudio em português, preservando o sentido e sem resumir. Retorne somente a transcrição. Se não houver fala compreensível, retorne uma string vazia.",
                    ],
                    config=types.GenerateContentConfig(temperature=0),
                )
                if response.text and response.text.strip():
                    self.provider_used = "gemini"
                    return response.text.strip()
                errors.append("Gemini retornou uma transcrição vazia.")
            except Exception as exc:
                errors.append(f"Gemini: {exc.__class__.__name__}")
        else:
            errors.append("Gemini sem chave configurada")

        try:
            converted = subprocess.run(
                ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", "pipe:0", "-ar", "16000", "-ac", "1", "-f", "wav", "pipe:1"],
                input=audio,
                capture_output=True,
                check=True,
                timeout=60,
            ).stdout
            if not converted or len(converted) > 32 * 1024 * 1024:
                raise ValueError("Áudio convertido vazio ou acima do limite para o fallback local.")
            response = httpx.post(
                f"{settings.ollama_base_url.rstrip('/')}/api/chat",
                json={
                    "model": settings.ollama_audio_model,
                    "messages": [{
                        "role": "user",
                        "content": "Transcreva integralmente este áudio em português. Preserve o sentido, não resuma e retorne somente a transcrição.",
                        "images": [base64.b64encode(converted).decode("ascii")],
                    }],
                    "stream": False,
                    "options": {"temperature": 0},
                },
                timeout=300,
            )
            response.raise_for_status()
            transcript = response.json().get("message", {}).get("content", "").strip()
            if not transcript:
                raise ValueError("Ollama retornou uma transcrição vazia.")
            self.provider_used = "ollama"
            return transcript
        except Exception as exc:
            errors.append(f"Ollama áudio: {exc.__class__.__name__}")

        raise LLMUnavailableError("Falha na transcrição do áudio. " + " | ".join(errors))

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
