from pathlib import Path
import re
import sqlite3

# --------------------------------------------------
# 1. Configuration
# --------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BACKEND_DIR / "portfolio_knowledge.db"

DEFAULT_TOP_K = 3

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
        "feature", "features", "task", "pomodoro", "timer",
        "notes", "dashboard", "heatmap", "progress", "category",
    },
    "testing": {
        "test", "testing", "pytest", "unit", "integration",
        "validation", "manual", "automated",
    },
}


def tokenize(text: str) -> set[str]:
    """Convert text to lowercase word tokens."""
    return set(re.findall(r"\b[a-zA-Z0-9_]+\b", text.lower()))


def make_fts_query(query: str) -> str:
    """Build a safe FTS5 query from the visitor's words."""
    words = re.findall(r"\b[a-zA-Z0-9_]+\b", query.lower())

    # Avoid overly short, unhelpful search queries.
    words = [word for word in words if len(word) > 1]

    if not words:
        return ""

    # OR allows a match when at least one useful term appears.
    # Quoting terms prevents user input from becoming FTS syntax.
    return " OR ".join(f'"{word}"' for word in words)


class PortfolioRetriever:
    """Retrieve portfolio passages using SQLite FTS5."""

    def __init__(self):
        if not DATABASE_PATH.exists():
            raise FileNotFoundError(
                f"Search database not found at {DATABASE_PATH}. "
                "Run ingest.py first."
            )

        self.connection = sqlite3.connect(
            str(DATABASE_PATH),
            check_same_thread=False,
        )
        self.connection.row_factory = sqlite3.Row

        try:
            self.collection_count = self.connection.execute(
                "SELECT COUNT(*) FROM chunks"
            ).fetchone()[0]

            # Verify that the FTS5 table is available and queryable.
            self.connection.execute(
                "SELECT rowid FROM chunks_fts LIMIT 1"
            ).fetchall()

        except sqlite3.Error:
            self.connection.close()
            raise

        if self.collection_count == 0:
            self.connection.close()
            raise ValueError(
                "The portfolio knowledge index is empty. "
                "Run ingest.py first."
            )

        print(
            "Portfolio retriever ready using SQLite FTS5. "
            f"Indexed chunks: {self.collection_count}"
        )

    @staticmethod
    def _keyword_bonus(
        query_tokens: set[str],
        document_tokens: set[str],
    ) -> float:
        """Add a small bonus for matching topic-specific terms."""
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
        candidate_multiplier: int = 5,
    ) -> list[dict]:
        """Search indexed passages and rank relevant results."""

        query = query.strip()

        if not query:
            return []

        if top_k < 1:
            raise ValueError("top_k must be at least 1.")

        if candidate_multiplier < 1:
            raise ValueError(
                "candidate_multiplier must be at least 1."
            )

        fts_query = make_fts_query(query)

        if not fts_query:
            return []

        candidate_count = top_k * candidate_multiplier

        # FTS5's BM25 returns lower values for better matches.
        rows = self.connection.execute(
            """
            SELECT
                chunks.id,
                chunks.chunk_id,
                chunks.source,
                chunks.chunk_index,
                chunks.document_type,
                chunks.content,
                bm25(chunks_fts) AS search_rank
            FROM chunks_fts
            JOIN chunks ON chunks.id = chunks_fts.rowid
            WHERE chunks_fts MATCH ?
            ORDER BY search_rank ASC
            LIMIT ?
            """,
            (fts_query, candidate_count),
        ).fetchall()

        if not rows:
            return []

        query_tokens = tokenize(query)
        matches = []

        for row in rows:
            content = row["content"]
            document_tokens = tokenize(content)

            keyword_bonus = self._keyword_bonus(
                query_tokens,
                document_tokens,
            )

            # BM25 is a ranking signal, not a probability.
            bm25_rank = float(row["search_rank"])

            matches.append(
                {
                    "text": content,
                    "source": row["source"],
                    "chunk_index": row["chunk_index"],
                    "document_type": row["document_type"],
                    "bm25_rank": bm25_rank,
                    "keyword_bonus": keyword_bonus,
                }
            )

        # BM25 already orders candidates by text relevance.
        # Apply a small bonus for domain-specific term overlap.
        matches.sort(
            key=lambda item: (
                item["bm25_rank"] - item["keyword_bonus"]
            )
        )

        return matches[:top_k]

    def close(self):
        """Close the SQLite connection."""
        self.connection.close()


# --------------------------------------------------
# 2. Interactive retrieval test
# --------------------------------------------------

if __name__ == "__main__":
    retriever = PortfolioRetriever()

    try:
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
                print(f"BM25 rank: {match['bm25_rank']:.4f}")
                print(
                    f"Keyword bonus: "
                    f"{match['keyword_bonus']:.4f}"
                )
                print(match["text"])
                print()

    finally:
        retriever.close()