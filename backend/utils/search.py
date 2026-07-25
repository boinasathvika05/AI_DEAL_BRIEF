import os
import urllib.parse
from typing import List, Dict, Any
from config import TAVILY_API_KEY, SERPER_API_KEY

def _search_tavily(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    from tavily import TavilyClient
    if not TAVILY_API_KEY:
        raise ValueError("TAVILY_API_KEY not set")
    client = TavilyClient(api_key=TAVILY_API_KEY)
    response = client.search(query=query, max_results=max_results)
    
    results = []
    for r in response.get("results", []):
        results.append({
            "title": r.get("title", ""),
            "link": r.get("url", ""),
            "snippet": r.get("content", "")
        })
    return results

def _search_serper(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    import requests
    if not SERPER_API_KEY:
        raise ValueError("SERPER_API_KEY not set")
    url = "https://google.serper.dev/search"
    payload = json.dumps({
      "q": query,
      "num": max_results
    })
    headers = {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    response.raise_for_status()
    data = response.json()
    
    results = []
    for r in data.get("organic", []):
        results.append({
            "title": r.get("title", ""),
            "link": r.get("link", ""),
            "snippet": r.get("snippet", "")
        })
    return results

def _search_googlesearch(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    from googlesearch import search
    results = []
    for url in search(query, num_results=max_results, advanced=True):
        results.append({
            "title": url.title,
            "link": url.url,
            "snippet": url.description
        })
    return results

def _search_duckduckgo(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    from duckduckgo_search import DDGS
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=max_results):
            results.append({
                "title": r.get("title", ""),
                "link": r.get("href", ""),
                "snippet": r.get("body", "")
            })
    return results

def perform_search(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Executes a search using a fallback chain:
    Tavily -> Serper -> Google Search -> DuckDuckGo
    """
    import json # For serper
    
    # 1. Try Tavily
    if TAVILY_API_KEY:
        try:
            print(f"Searching Tavily for: {query}")
            return _search_tavily(query, max_results)
        except Exception as e:
            print(f"Tavily search failed: {e}. Falling back...")
            
    # 2. Try Serper
    if SERPER_API_KEY:
        try:
            print(f"Searching Serper for: {query}")
            return _search_serper(query, max_results)
        except Exception as e:
            print(f"Serper search failed: {e}. Falling back...")
            
    # 3. Try Google Search (googlesearch-python)
    try:
        print(f"Searching Google for: {query}")
        return _search_googlesearch(query, max_results)
    except Exception as e:
        print(f"Google search failed: {e}. Falling back to DuckDuckGo...")
        
    # 4. Try DuckDuckGo
    try:
        print(f"Searching DuckDuckGo for: {query}")
        return _search_duckduckgo(query, max_results)
    except Exception as e:
        print(f"DuckDuckGo search failed: {e}")
        return []

if __name__ == "__main__":
    # Simple test
    print(perform_search("OpenAI recent news"))
