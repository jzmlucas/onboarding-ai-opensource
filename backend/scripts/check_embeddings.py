from app.services.embeddings import embed_documents, embed_query, get_embedding_model


def main() -> None:
    model = get_embedding_model()
    print(f"Modelo carregado: {model}")
    document_vectors = embed_documents(["passage: teste de indexação do OnboardIA"])
    query_vector = embed_query("query: como funciona o onboarding?")
    print(f"Dimensão do embedding de documento: {len(document_vectors[0])}")
    print(f"Dimensão do embedding de consulta: {len(query_vector)}")
    print("Teste de embeddings concluído com sucesso.")


if __name__ == "__main__":
    main()
