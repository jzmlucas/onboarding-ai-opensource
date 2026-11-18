from threading import Lock

from sentence_transformers import SentenceTransformer

from app.core.config import settings


_model_lock = Lock()
_embedding_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
    """Load the embedding model once, with eager weight materialization."""
    global _embedding_model
    if _embedding_model is not None:
        return _embedding_model

    with _model_lock:
        if _embedding_model is not None:
            return _embedding_model

        model = SentenceTransformer(
            settings.embedding_model,
            device=settings.embedding_device,
            model_kwargs={"low_cpu_mem_usage": False},
        )

        # Catch incomplete meta initialization before it fails later in encode().
        meta_parameters = [
            name
            for name, parameter in model.named_parameters()
            if getattr(parameter, "is_meta", False)
        ]
        if meta_parameters:
            preview = ", ".join(meta_parameters[:5])
            raise RuntimeError(
                "The embedding model loaded with parameters without weights (device=meta). "
                f"Affected parameters: {preview}. Check torch/transformers/"
                "sentence-transformers versions and the Hugging Face cache."
            )

        _embedding_model = model
        return _embedding_model


def embed_documents(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    model = get_embedding_model()
    prepared = [f"passage: {text}" for text in texts]
    vectors = model.encode(
        prepared,
        batch_size=settings.embedding_batch_size,
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=False,
    )
    return [vector.astype(float).tolist() for vector in vectors]


def embed_query(text: str) -> list[float]:
    model = get_embedding_model()
    vector = model.encode(
        [f"query: {text}"],
        normalize_embeddings=True,
        convert_to_numpy=True,
        show_progress_bar=False,
    )[0]
    return vector.astype(float).tolist()
