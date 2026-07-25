from schemas.models import DealInput, CompanyResearch, FinancialAnalysis
from utils.llm import generate_structured_response
from prompts.agent_prompts import FINANCIAL_SYSTEM_PROMPT

def run_financial_agent(cleaned_input: DealInput, research: CompanyResearch) -> FinancialAnalysis:
    user_prompt = f"""
Please perform a financial analysis based on the following:

Company Input:
{cleaned_input.model_dump_json()}

Research Context:
{research.model_dump_json()}
"""
    
    result = generate_structured_response(
        system_prompt=FINANCIAL_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=FinancialAnalysis
    )
    
    return result
