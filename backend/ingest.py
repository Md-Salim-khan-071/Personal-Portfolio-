from pathlib import Path
import hashlib
import sqlite3

import pymupdf


# --------------------------------------------------
# 1. Configuration
# --------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent

KNOWLEDGE_DIR = PROJECT_DIR / "knowledge_base"
DATABASE_PATH = BACKEND_DIR / "portfolio_knowledge.db"

CHUNK_SIZE = 180
CHUNK_OVERLAP = 40


# --------------------------------------------------
# 2. Document readers
# --------------------------------------------------

def read_pdf(path: Path) -> str:
    """Extract text from a PDF."""
    pages = []

    with pymupdf.open(path) as pdf:
        for page_number, page in enumerate(pdf, start=1):
            text = page.get_text("text").strip()

            if text:
                pages.append(f"[Page {page_number}]\n{text}")

    return "\n\n".join(pages)


def read_markdown(path: Path) -> str:
    """Read a Markdown knowledge document."""
    return path.read_text(encoding="utf-8").strip()


# --------------------------------------------------
# 3. Text chunking
# --------------------------------------------------

def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[str]:
    """Split text into overlapping word-based chunks."""

    if chunk_size < 1:
        raise ValueError("chunk_size must be at least 1.")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError(
            "overlap must be non-negative and smaller than chunk_size."
        )

    words = text.split()

    if not words:
        return []

    chunks = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))

        if end == len(words):
            break

        start = end - overlap

    return chunks


# --------------------------------------------------
# 4. SQLite database setup
# --------------------------------------------------

def initialize_database(connection: sqlite3.Connection) -> None:
    """Create the document table and its FTS5 search index."""

    connection.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY,
            chunk_id TEXT NOT NULL UNIQUE,
            source TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            document_type TEXT NOT NULL,
            content TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts
        USING fts5(
            content,
            content='chunks',
            content_rowid='id'
        )
    """)


# --------------------------------------------------
# 5. Ingestion
# --------------------------------------------------

def main() -> None:
    if not KNOWLEDGE_DIR.exists():
        raise FileNotFoundError(
            f"Knowledge folder not found: {KNOWLEDGE_DIR}"
        )

    files = sorted(
        path
        for path in KNOWLEDGE_DIR.rglob("*")
        if path.is_file()
        and path.suffix.lower() in {".pdf", ".md"}
    )

    if not files:
        raise FileNotFoundError(
            f"No PDF or Markdown files found in {KNOWLEDGE_DIR}"
        )

    records = []

    print(f"Found {len(files)} source file(s).")

    for path in files:
        relative_path = path.relative_to(PROJECT_DIR).as_posix()
        print(f"Reading: {relative_path}")

        if path.suffix.lower() == ".pdf":
            text = read_pdf(path)
        else:
            text = read_markdown(path)

        if not text:
            print(f"Skipping empty document: {relative_path}")
            continue

        chunks = chunk_text(text)

        for index, chunk in enumerate(chunks):
            unique_text = f"{relative_path}:{index}:{chunk}"

            chunk_id = hashlib.sha256(
                unique_text.encode("utf-8")
            ).hexdigest()

            records.append((
                chunk_id,
                relative_path,
                index,
                path.suffix.lower().lstrip("."),
                chunk,
            ))

    if not records:
        raise ValueError(
            "No readable text was found in your documents."
        )

    # FTS5 must be supported by the SQLite build.
    with sqlite3.connect(DATABASE_PATH) as connection:
        initialize_database(connection)

        print(f"Indexing {len(records)} chunks with SQLite FTS5...")

        # Replace the previous index atomically.
        with connection:
            connection.execute("DELETE FROM chunks")

            connection.executemany(
                """
                INSERT INTO chunks (
                    chunk_id,
                    source,
                    chunk_index,
                    document_type,
                    content
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                records,
            )

            # Rebuild the full-text index from the new chunks.
            connection.execute("""
                INSERT INTO chunks_fts(chunks_fts)
                VALUES ('rebuild')
            """)

    print("\nIngestion complete.")
    print(f"Source files found: {len(files)}")
    print(f"Chunks indexed: {len(records)}")
    print(f"SQLite database: {DATABASE_PATH}")


if __name__ == "__main__":
    main()
