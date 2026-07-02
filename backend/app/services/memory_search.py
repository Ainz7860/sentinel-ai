import math
import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Incident

def tokenize(text: str) -> List[str]:
    """Tokenize and clean string input."""
    if not text:
        return []
    words = re.findall(r"\b\w+\b", text.lower())
    # Ignore short noise terms
    stop_words = {"the", "and", "a", "of", "in", "to", "is", "for", "on", "with", "at", "by", "from"}
    return [w for w in words if len(w) > 2 and w not in stop_words]

def compute_tf(tokens: List[str]) -> Dict[str, float]:
    """Compute term frequency."""
    tf = {}
    if not tokens:
        return tf
    for t in tokens:
        tf[t] = tf.get(t, 0) + 1
    total = len(tokens)
    for t in tf:
        tf[t] = tf[t] / total
    return tf

class MemorySearchService:
    @staticmethod
    async def find_similar_incidents(
        query: str, 
        db: AsyncSession, 
        limit: int = 3, 
        threshold: float = 0.1
    ) -> List[Tuple[Incident, float]]:
        """
        Runs a TF-IDF text similarity search over all incidents in SQLite.
        Returns a list of tuples containing (Incident, similarity_score).
        """
        # 1. Fetch all incidents from DB
        result = await db.execute(select(Incident))
        incidents = result.scalars().all()
        
        if not incidents or not query:
            return []

        query_tokens = tokenize(query)
        if not query_tokens:
            return []

        # 2. Tokenize and compute TF for all documents
        doc_tokens_list = []
        doc_tfs = []
        vocabulary = set(query_tokens)
        
        for inc in incidents:
            content = f"{inc.title} {inc.description} {inc.mitre_attack or ''} {inc.response_action or ''}"
            tokens = tokenize(content)
            doc_tokens_list.append(tokens)
            doc_tfs.append(compute_tf(tokens))
            for t in tokens:
                vocabulary.add(t)

        # 3. Compute IDF for the vocabulary
        num_docs = len(incidents)
        idf = {}
        for term in vocabulary:
            # Count document frequency
            df = sum(1 for tokens in doc_tokens_list if term in tokens)
            # Add smoothing to avoid division by zero
            idf[term] = math.log((1 + num_docs) / (1 + df)) + 1

        # 4. Vectorize query
        query_tf = compute_tf(query_tokens)
        query_vector = {}
        query_norm = 0.0
        for term in query_tokens:
            val = query_tf[term] * idf[term]
            query_vector[term] = val
            query_norm += val * val
        query_norm = math.sqrt(query_norm)

        if query_norm == 0:
            return []

        # 5. Compute cosine similarities
        matches = []
        for idx, inc in enumerate(incidents):
            doc_tf = doc_tfs[idx]
            doc_vector = {}
            doc_norm = 0.0
            dot_product = 0.0
            
            for term, tf_val in doc_tf.items():
                val = tf_val * idf[term]
                doc_vector[term] = val
                doc_norm += val * val
                if term in query_vector:
                    dot_product += query_vector[term] * val
            
            doc_norm = math.sqrt(doc_norm)
            if doc_norm == 0:
                continue

            similarity = dot_product / (query_norm * doc_norm)
            if similarity >= threshold:
                matches.append((inc, round(similarity, 3)))

        # 6. Sort and limit results
        matches.sort(key=lambda x: x[1], reverse=True)
        return matches[:limit]

memory_search_service = MemorySearchService()
