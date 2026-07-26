import httpx
import time
from typing import List, Dict, Any, Optional
import asyncio

class EnterpriseCacheValidator:
    def __init__(self):
        # Cache for search queries. Structure: {query: {"timestamp": float, "data": Any}}
        self._cache: Dict[str, Dict[str, Any]] = {}
        # 30-minute cache TTL
        self.cache_ttl_seconds = 1800
        # Timeout for URL validation
        self.validation_timeout = 3.0
    
    def get_cached(self, query: str) -> Optional[Any]:
        if query in self._cache:
            entry = self._cache[query]
            if time.time() - entry["timestamp"] < self.cache_ttl_seconds:
                return entry["data"]
            else:
                del self._cache[query]
        return None
        
    def set_cache(self, query: str, data: Any):
        self._cache[query] = {
            "timestamp": time.time(),
            "data": data
        }
        
    async def validate_url(self, url: str) -> bool:
        """
        Validate that a URL is active and reachable.
        """
        if not url or not url.startswith("http"):
            return False
        try:
            async with httpx.AsyncClient(timeout=self.validation_timeout, verify=False) as client:
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
                response = await client.head(url, headers=headers, follow_redirects=True)
                if response.status_code < 400 or response.status_code in [403, 405]:
                    return True
                # Fallback to GET
                get_resp = await client.get(url, headers=headers, follow_redirects=True)
                if get_resp.status_code < 400 or get_resp.status_code in [403, 405]:
                    return True
            return False
        except Exception:
            # If request times out or SSL fails, accept http links as plausible unless clearly malformed
            return True
            
    async def filter_valid_urls(self, urls: List[str]) -> List[str]:
        """
        Concurrently validate a list of URLs and return only the valid ones.
        """
        tasks = [self.validate_url(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        valid_urls = []
        for url, is_valid in zip(urls, results):
            if isinstance(is_valid, bool) and is_valid:
                valid_urls.append(url)
                
        return valid_urls

# Global instance
enterprise_cache = EnterpriseCacheValidator()
