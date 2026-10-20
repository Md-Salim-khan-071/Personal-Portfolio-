
from pathlib import Path
import hashlib

import chromadb
import pymupdf
from sentence_transformers import SentenceTransformer


# Paths
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BACKEND_DIR.parent

KNOWLEDGE_DIR = PROJECT_DIR / "knowledge_base"
CHROMA_DIR = BACKEND_DIR / "chroma_db"

COLLECTION_NAME = "portfolio_knowledge"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

CHUNK_SIZE = 180
CHUNK_OVERLAP = 40


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


def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[str]:
    """Split text into overlapping word-based chunks."""
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


def main():
    if not KNOWLEDGE_DIR.exists():
        raise FileNotFoundError(
            f"Knowledge folder not found: {KNOWLEDGE_DIR}"
        )

    # Find supported files recursively.
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

    documents = []
    ids = []
    metadatas = []

    # Load the current collection.
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

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
            # Stable IDs make it possible to update chunks.
            unique_text = f"{relative_path}:{index}:{chunk}"
            chunk_id = hashlib.sha256(
                unique_text.encode("utf-8")
            ).hexdigest()

            ids.append(chunk_id)
            documents.append(chunk)
            metadatas.append(
                {
                    "source": relative_path,
                    "chunk_index": index,
                    "document_type": path.suffix.lower().lstrip("."),
                }
            )

    if not documents:
        raise ValueError("No readable text was found in your documents.")

    # Build embeddings for all current source documents.
    print("Loading embedding model...")
    model = SentenceTransformer(EMBEDDING_MODEL)

    print(f"Creating embeddings for {len(documents)} chunks...")
    embeddings = model.encode(
        documents,
        normalize_embeddings=True,
        show_progress_bar=True,
    ).tolist()

    # Synchronize the collection with the current knowledge files.
    # This removes outdated chunks, including chunks from deleted files.
    existing = collection.get(include=["metadatas"])

    if existing["ids"]:
        collection.delete(ids=existing["ids"])

    # Insert the complete current index.
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings,
    )

    print("\nIndexing complete.")
    print(f"Source files found: {len(files)}")
    print(f"Chunks indexed: {len(documents)}")
    print(f"Vector database: {CHROMA_DIR}")


if __name__ == "__main__":
    main()
