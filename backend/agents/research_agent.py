import json
import asyncio
from schemas.models import DealInput, CompanyResearch
from utils.llm import generate_structured_response
from utils.search import perform_search_async

async def run_research_agent_async(cleaned_input: DealInput) -> CompanyResearch:
    print(f"Researching: {cleaned_input.company_name}")
    
    # 1. Comprehensive deep evidence queries
    queries = [
        f"{cleaned_input.company_name} {cleaned_input.industry} business model products services",
        f"{cleaned_input.company_name} news recent developments",
        f"{cleaned_input.company_name} competitors {cleaned_input.industry}",
        f"{cleaned_input.company_name} headquarters founded employees revenue financials",
        f"{cleaned_input.company_name} funding history investors capital raised"
    ]
    
    search_context = []
    sources = set()
    source_details = []
    
    # Run all search queries concurrently
    tasks = [perform_search_async(q, max_results=5) for q in queries]
    results_lists = await asyncio.gather(*tasks, return_exceptions=True)
    
    for results in results_lists:
        if isinstance(results, list):
            for r in results:
                link = r.get('link', '')
                if link and link not in sources:
                    sources.add(link)
                    source_details.append({
                        "url": link,
                        "title": r.get('title', ''),
                        "provider": r.get('source', 'unknown')
                    })
                    search_context.append(f"Title: {r.get('title')}\nSource: {link}\nSnippet: {r.get('snippet')}")
            
    # Combine search context with input
    context_str = "\n\n".join(search_context)
    
    system_prompt = (
        "You are an expert Investment Banking Enterprise Research Analyst. "
        "Your job is to compile a highly accurate, deep research dossier on a company. "
        "CRITICAL INSTRUCTIONS:\n"
        "1. You MUST rely ONLY on the provided SEARCH RESULTS CONTEXT and the initial input.\n"
        "2. DO NOT hallucinate or guess any facts, numbers, or competitors.\n"
        "3. If the search results do not provide enough information for a field, clearly state: 'Information unavailable from public sources'.\n"
        "4. Fill out ALL new optional evidence fields (headquarters, founded, revenue_public, etc.) if data is found in the search context.\n"
        "5. For 'verified_fields', provide a JSON dictionary mapping fields (e.g. 'revenue', 'employees') to a status ('Verified Publicly', 'Unverified/Self-Reported', 'Conflicting Data').\n"
        "6. Calculate a 'confidence_level' (0.0 to 1.0) based on how much of the user's input matches the public data.\n"
        "7. Ensure your analysis is professional, objective, and deeply structured."
    )
    
    user_prompt = f"""
Input Data:
{cleaned_input.model_dump_json(indent=2)}

Live Search Results Context:
{context_str}

Analyze the above data and provide a strictly factual CompanyResearch dossier.
For the `sources_used` field, use the following extracted source links:
{json.dumps(list(sources), indent=2)}
"""
    
    # Generate structured extraction
    result = await asyncio.to_thread(
        generate_structured_response,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_schema=CompanyResearch
    )
    
    # Enforce sources and append detail
    if not result.sources_used or len(result.sources_used) == 0:
        result.sources_used = list(sources)[:15] # limit to 15 max
    
    # Attach raw source details for downstream transparency
    result.verified_sources = source_details[:15]
        
    return result

def run_research_agent(cleaned_input: DealInput) -> CompanyResearch:
    """
    Synchronous wrapper for backward compatibility with orchestrator.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import nest_asyncio
            nest_asyncio.apply()
            return loop.run_until_complete(run_research_agent_async(cleaned_input))
        else:
            return loop.run_until_complete(run_research_agent_async(cleaned_input))
    except Exception:
        return asyncio.run(run_research_agent_async(cleaned_input))
