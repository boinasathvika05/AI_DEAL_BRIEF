from schemas.models import DealInput, CompanyResearch, FinancialAnalysis, FinancingRecommendation, LenderMatching, FinalReport
from utils.llm import generate_structured_response
from prompts.agent_prompts import REPORT_SYSTEM_PROMPT

def run_report_agent(
    cleaned_input: DealInput, 
    research: CompanyResearch, 
    financial: FinancialAnalysis, 
    recommendation: FinancingRecommendation,
    lender: LenderMatching
) -> FinalReport:
    user_prompt = f"""
Please generate the final Deal Brief based on all previous context:

Company Input:
{cleaned_input.model_dump_json(indent=2)}

Research Context:
{research.model_dump_json(indent=2)}

Financial Analysis:
{financial.model_dump_json(indent=2)}

Financing Recommendation:
{recommendation.model_dump_json(indent=2)}

Lender Matching:
{lender.model_dump_json(indent=2)}
"""
    
    result = generate_structured_response(
        system_prompt=REPORT_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=FinalReport
    )
    
    # Calculate an overall AI confidence score by averaging the sub-scores or using the one from research.
    # The LLM will populate it as instructed in the prompt, but we could also calculate it manually here if we wanted.
    
    return result
