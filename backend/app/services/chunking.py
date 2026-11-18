import re
from functools import lru_cache

from transformers import AutoTokenizer

from app.core.config import settings


@lru_cache(maxsize=1)
def get_tokenizer():
    return AutoTokenizer.from_pretrained(settings.embedding_model)


def chunk_text(text: str) -> list[dict[str, int | str]]:
    """Sentence-aware, tokenizer-sized chunks with a token overlap."""
    if not text.strip():
        return []

    tokenizer = get_tokenizer()
    sentences = re.split(r"(?<=[.!?])\s+|\n+", text.strip())
    chunks: list[dict[str, int | str]] = []
    current: list[str] = []
    current_tokens = 0

    def token_count(value: str) -> int:
        return len(tokenizer.encode(value, add_special_tokens=False))

    def flush() -> None:
        nonlocal current, current_tokens
        content = " ".join(part.strip() for part in current if part.strip()).strip()
        if content:
            chunks.append({"content": content, "token_count": token_count(content)})
        if settings.chunk_overlap_tokens > 0 and current:
            overlap: list[str] = []
            overlap_count = 0
            for sentence in reversed(current):
                count = token_count(sentence)
                if overlap and overlap_count + count > settings.chunk_overlap_tokens:
                    break
                overlap.insert(0, sentence)
                overlap_count += count
                if overlap_count >= settings.chunk_overlap_tokens:
                    break
            current = overlap
            current_tokens = overlap_count
        else:
            current, current_tokens = [], 0

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        count = token_count(sentence)
        if count > settings.chunk_size_tokens:
            if current:
                flush()
            token_ids = tokenizer.encode(sentence, add_special_tokens=False)
            step = max(1, settings.chunk_size_tokens - settings.chunk_overlap_tokens)
            for start in range(0, len(token_ids), step):
                piece = tokenizer.decode(token_ids[start : start + settings.chunk_size_tokens]).strip()
                if piece:
                    chunks.append({"content": piece, "token_count": len(tokenizer.encode(piece, add_special_tokens=False))})
            current, current_tokens = [], 0
            continue
        if current and current_tokens + count > settings.chunk_size_tokens:
            flush()
        current.append(sentence)
        current_tokens += count

    if current:
        content = " ".join(current).strip()
        if content:
            chunks.append({"content": content, "token_count": token_count(content)})
    return chunks
