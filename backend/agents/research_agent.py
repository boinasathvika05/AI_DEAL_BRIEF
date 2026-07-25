import json
from schemas.models import DealInput, CompanyResearch
from utils.llm import generate_structured_response
from utils.search import perform_search

def run_research_agent(cleaned_input: DealInput) -> CompanyResearch:
    print(f"Researching: {cleaned_input.company_name}")
    
    # Run a few basic queries
    queries = [
        f"{cleaned_input.company_name} {cleaned_input.industry} business model products services",
        f"{cleaned_input.company_name} news recent developments",
        f"{cleaned_input.company_name} competitors {cleaned_input.industry}"
    ]
    
    search_context = []
    sources = set()
    
    for q in queries:
        results = perform_search(q, max_results=3)
        for r in results:
            search_context.append(f"Title: {r['title']}\nSnippet: {r['snippet']}")
            sources.add(r['link'])
            
    # Combine search context with input
    context_str = "\n\n".join(search_context)
    
    system_prompt = (
        "You are an expert Investment Banking Research Analyst. "
        "Your job is to compile a highly accurate research dossier on a company. "
        "CRITICAL INSTRUCTION: You MUST rely ONLY on the provided SEARCH RESULTS CONTEXT and the initial input. "
        "DO NOT hallucinate or guess any facts, numbers, or competitors. "
        "If the search results do not provide enough information for a field, clearly state: 'Information unavailable from public sources'. "
        "Ensure your analysis is professional, objective, and structured."
    )
    
    user_prompt = f"""
Input Data:
{cleaned_input.model_dump_json()}

Live Search Results Context:
{context_str}

Analyze the above data and provide a strictly factual CompanyResearch dossier.
For the `sources_used` field, use the following extracted source links:
{list(sources)}
"""
    
    result = generate_structured_response(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        response_schema=CompanyResearch
    )
    
    # Enforce sources
    if not result.sources_used or len(result.sources_used) == 0:
        result.sources_used = list(sources)[:10] # limit to 10 max
        
    return result
