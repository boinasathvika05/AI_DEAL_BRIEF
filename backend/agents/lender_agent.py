from schemas.models import DealInput, CompanyResearch, FinancialAnalysis, FinancingRecommendation, LenderMatching
from utils.llm import generate_structured_response
from prompts.agent_prompts import LENDER_SYSTEM_PROMPT

def run_lender_agent(cleaned_input: DealInput, research: CompanyResearch, financial: FinancialAnalysis, recommendation: FinancingRecommendation) -> LenderMatching:
    user_prompt = f"""
Please suggest suitable lender categories based on the following context:

Company Input:
{cleaned_input.model_dump_json(indent=2)}

Research Context:
{research.model_dump_json(indent=2)}

Financial Analysis:
{financial.model_dump_json(indent=2)}

Financing Recommendation:
{recommendation.model_dump_json(indent=2)}
"""
    
    result = generate_structured_response(
        system_prompt=LENDER_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=LenderMatching
    )
    
    return result
