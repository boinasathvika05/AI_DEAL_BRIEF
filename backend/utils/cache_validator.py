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
        Validate that a URL returns a 200 OK status.
        """
        try:
            async with httpx.AsyncClient(timeout=self.validation_timeout, verify=False) as client:
                response = await client.head(url, follow_redirects=True)
                if response.status_code == 200:
                    return True
                # Fallback to GET if HEAD is not allowed
                if response.status_code in [403, 405, 401]:
                    headers = {"Range": "bytes=0-10", "User-Agent": "Mozilla/5.0"}
                    get_resp = await client.get(url, headers=headers, follow_redirects=True)
                    if get_resp.status_code in [200, 206]:
                        return True
            return False
        except Exception:
            return False
            
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
