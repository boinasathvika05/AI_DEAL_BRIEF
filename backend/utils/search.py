import os
import urllib.parse
import asyncio
from typing import List, Dict, Any
from config import TAVILY_API_KEY, SERPER_API_KEY, ACTIVE_SEARCH_PROVIDER
from utils.cache_validator import enterprise_cache

async def _search_tavily(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
    if not TAVILY_API_KEY:
        return []
    import httpx
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "max_results": max_results,
        "include_answer": True
    }
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                return []
            data = response.json()
            results = []
            for r in data.get("results", []):
                results.append({
                    "title": r.get("title", ""),
                    "link": r.get("url", ""),
                    "snippet": r.get("content", r.get("snippet", "")),
                    "source": "tavily"
                })
            return results
    except Exception as e:
        print(f"Tavily search notice: {e}")
        return []

async def _search_serper(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
    if not SERPER_API_KEY:
        return []
    import httpx
    url = "https://google.serper.dev/search"
    payload = {
        "q": query,
        "num": max_results
    }
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                return []
            data = response.json()
            results = []
            for r in data.get("organic", []):
                results.append({
                    "title": r.get("title", ""),
                    "link": r.get("link", ""),
                    "snippet": r.get("snippet", ""),
                    "source": "serper"
                })
            return results
    except Exception as e:
        print(f"Serper search notice: {e}")
        return []

async def _search_ddgs(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
    try:
        from duckduckgo_search import DDGS
        def sync_ddgs():
            with DDGS() as ddgs:
                return list(ddgs.text(query, max_results=max_results))
        raw_results = await asyncio.to_thread(sync_ddgs)
        results = []
        for r in raw_results:
            results.append({
                "title": r.get("title", ""),
                "link": r.get("href", ""),
                "snippet": r.get("body", ""),
                "source": "ddgs"
            })
        return results
    except Exception as e:
        print(f"DDGS search notice: {e}")
        return []

async def perform_search_async(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Concurrent real-time web search integration using Tavily, Serper, and DDGS APIs.
    Validates URLs, deduplicates, and utilizes cache.
    """
    cached = enterprise_cache.get_cached(query)
    if cached is not None:
        return cached

    # Run searches concurrently
    tasks = [
        _search_tavily(query, max_results),
        _search_serper(query, max_results),
        _search_ddgs(query, max_results)
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    aggregated = []
    seen_urls = set()
    
    for provider_results in results:
        if isinstance(provider_results, list):
            for res in provider_results:
                link = res.get("link")
                if link and link not in seen_urls:
                    seen_urls.add(link)
                    aggregated.append(res)
                    
    # Validate URLs concurrently
    urls_to_validate = [res["link"] for res in aggregated]
    valid_urls = await enterprise_cache.filter_valid_urls(urls_to_validate)
    
    # Filter aggregated results by valid URLs
    valid_results = [res for res in aggregated if res["link"] in valid_urls]
    
    # Fallback to aggregated if URL validation stripped all results
    if not valid_results and aggregated:
        valid_results = aggregated
    
    # Rank by "authority" implicitly based on domains (e.g. sec.gov, bloomberg, etc)
    authority_domains = ['sec.gov', 'bloomberg.com', 'reuters.com', 'cnbc.com', 'wsj.com', 'ft.com', 'crunchbase.com', 'pitchbook.com']
    
    def score_result(res: Dict[str, Any]) -> int:
        link = res.get("link", "").lower()
        score = 0
        for domain in authority_domains:
            if domain in link:
                score += 10
        if ".gov" in link:
            score += 5
        if ".edu" in link:
            score += 2
        return score
        
    valid_results.sort(key=score_result, reverse=True)
    
    # Take top N
    final_results = valid_results[:max_results*2]  # Keep a bit more than single provider max
    
    enterprise_cache.set_cache(query, final_results)
    return final_results

def perform_search(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
    """
    Synchronous wrapper for backward compatibility.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import nest_asyncio
            nest_asyncio.apply()
            return loop.run_until_complete(perform_search_async(query, max_results))
        else:
            return loop.run_until_complete(perform_search_async(query, max_results))
    except Exception:
        return asyncio.run(perform_search_async(query, max_results))
