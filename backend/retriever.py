from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


# --------------------------------------------------
# 1. Configuration
# --------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parent
CHROMA_DIR = BACKEND_DIR / "chroma_db"

COLLECTION_NAME = "portfolio_knowledge"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

DEFAULT_TOP_K = 3
CANDIDATE_MULTIPLIER = 5


# --------------------------------------------------
# 2. Optional keyword relevance hints
# --------------------------------------------------

TOPIC_TERMS = {
    "architecture": {
        "architecture", "backend", "frontend", "api",
        "database", "sqlalchemy", "fastapi", "schema",
        "deployment", "server", "client",
    },
    "database": {
        "database", "postgresql", "postgres", "sql",
        "supabase", "sqlite", "storage", "persist",
    },
    "features": {
        "feature", "task", "pomodoro", "timer", "notes",
        "dashboard", "heatmap", "progress", "category",
    },
    "testing": {
        "test", "testing", "pytest", "unit", "integration",
        "validation", "manual", "automated",
    },
}


def tokenize(text: str) -> set[str]:
    """Convert text into lowercase word tokens."""
    return {
        word.strip(".,!?():;[]{}'\"").lower()
        for word in text.split()
        if word.strip(".,!?():;[]{}'\"")
    }


# --------------------------------------------------
# 3. Portfolio retriever
# --------------------------------------------------

class PortfolioRetriever:
    """
    Retrieve portfolio passages using semantic embeddings,
    then rank them using semantic similarity and keyword overlap.
    """

    def __init__(self):
        if not CHROMA_DIR.exists():
            raise FileNotFoundError(
                f"Vector database not found at {CHROMA_DIR}. "
                "Run ingest.py first."
            )

        print("Loading embedding model...")
        self.model = SentenceTransformer(EMBEDDING_MODEL)

        print("Connecting to ChromaDB...")
        self.client = chromadb.PersistentClient(
            path=str(CHROMA_DIR)
        )

        self.collection = self.client.get_collection(
            name=COLLECTION_NAME
        )

        chunk_count = self.collection.count()

        if chunk_count == 0:
            raise ValueError(
                "The portfolio knowledge collection is empty. "
                "Run ingest.py first."
            )

        print(
            "Portfolio retriever ready. "
            f"Indexed chunks: {chunk_count}"
        )

    @staticmethod
    def _topic_bonus(
        query_tokens: set[str],
        document_tokens: set[str],
    ) -> float:
        """Calculate a small keyword-overlap relevance bonus."""
        bonus = 0.0

        for terms in TOPIC_TERMS.values():
            if query_tokens.intersection(terms):
                overlap = (
                    query_tokens
                    .intersection(terms)
                    .intersection(document_tokens)
                )

                if overlap:
                    bonus += min(0.04 * len(overlap), 0.08)

        return min(bonus, 0.12)

    def search(
        self,
        query: str,
        top_k: int = DEFAULT_TOP_K,
        candidate_multiplier: int = CANDIDATE_MULTIPLIER,
    ) -> list[dict]:
        """
        1. Embed the visitor's query.
        2. Retrieve candidate passages from ChromaDB.
        3. Calculate semantic similarity and keyword bonus.
        4. Rank candidates and return the best top_k passages.
        """

        query = query.strip()

        if not query:
            return []

        if top_k < 1:
            raise ValueError("top_k must be at least 1.")

        if candidate_multiplier < 1:
            raise ValueError(
                "candidate_multiplier must be at least 1."
            )

        total_chunks = self.collection.count()

        if total_chunks == 0:
            return []

        # Step A: Embed the query.
        query_embedding = self.model.encode(
            [query],
            normalize_embeddings=True,
        )[0]

        # Step B: Retrieve more candidates than we need.
        candidate_count = min(
            top_k * candidate_multiplier,
            total_chunks,
        )

        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=candidate_count,
            include=[
                "documents",
                "metadatas",
                "distances",
            ],
        )

        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        query_tokens = tokenize(query)
        matches = []

        # Step C: Calculate scores for each candidate.
        for document, metadata, distance in zip(
            documents, metadatas, distances
        ):
            metadata = metadata or {}

            semantic_distance = float(distance)

            # ChromaDB returns cosine distance for this collection.
            # Smaller distance means a closer semantic match.
            semantic_score = 1.0 - semantic_distance

            keyword_bonus = self._topic_bonus(
                query_tokens,
                tokenize(document),
            )

            matches.append(
                {
                    "text": document,
                    "source": metadata.get(
                        "source", "unknown"
                    ),
                    "chunk_index": metadata.get("chunk_index"),
                    "distance": semantic_distance,
                    "semantic_score": semantic_score,
                    "keyword_bonus": keyword_bonus,
                    "final_score": (
                        semantic_score + keyword_bonus
                    ),
                }
            )

        if not matches:
            return []

        # Step D: Rank using semantic similarity and keyword overlap.
        matches.sort(
            key=lambda item: item["final_score"],
            reverse=True,
        )

        return matches[:top_k]


# --------------------------------------------------
# 4. Interactive retrieval test
# --------------------------------------------------

if __name__ == "__main__":
    retriever = PortfolioRetriever()

    while True:
        question = input(
            "\nAsk something about your portfolio "
            "(or type 'exit'): "
        ).strip()

        if question.lower() in {"exit", "quit"}:
            break

        try:
            matches = retriever.search(question, top_k=3)

        except Exception as exc:
            print(
                f"Search failed: {type(exc).__name__}: {exc}"
            )
            continue

        if not matches:
            print("No matching passages found.")
            continue

        print("\nRetrieved passages:\n")

        for index, match in enumerate(matches, start=1):
            print(f"--- Match {index} ---")
            print(f"Source: {match['source']}")
            print(f"Chunk: {match['chunk_index']}")
            print(f"Distance: {match['distance']:.4f}")
            print(
                f"Semantic score: "
                f"{match['semantic_score']:.4f}"
            )
            print(
                f"Keyword bonus: "
                f"{match['keyword_bonus']:.4f}"
            )
            print(
                f"Final ranking score: "
                f"{match['final_score']:.4f}"
            )
            print(match["text"])
            print()