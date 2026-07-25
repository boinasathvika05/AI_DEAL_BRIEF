import json
import asyncio
from schemas.models import DealInput, FinalReport
from agents.validation_agent import run_validation_agent
from agents.research_agent import run_research_agent
from agents.financial_agent import run_financial_agent
from agents.recommendation_agent import run_recommendation_agent
from agents.lender_agent import run_lender_agent
from agents.report_agent import run_report_agent

async def generate_deal_brief_workflow(deal_input: DealInput):
    # Validation
    yield {"event": "progress", "data": json.dumps({"step": "validation", "status": "running", "message": "Validating Input..."})}
    validation_result = await asyncio.to_thread(run_validation_agent, deal_input)
    if not validation_result.is_valid:
        yield {"event": "error", "data": json.dumps({"step": "validation", "message": f"Validation failed: {', '.join(validation_result.missing_fields)} {', '.join(validation_result.inconsistencies)}"})}
        return
    yield {"event": "progress", "data": json.dumps({"step": "validation", "status": "complete", "message": "Validation Complete"})}
    
    # Research
    yield {"event": "progress", "data": json.dumps({"step": "research", "status": "running", "message": "Scraping Public Web & Gathering Live Intelligence..."})}
    research_result = await asyncio.to_thread(run_research_agent, validation_result.cleaned_input)
    yield {"event": "progress", "data": json.dumps({"step": "research", "status": "complete", "message": "Live Research Complete"})}
    
    # Financial
    yield {"event": "progress", "data": json.dumps({"step": "financial", "status": "running", "message": "Calculating Debt Ratios & Financial Health..."})}
    financial_result = await asyncio.to_thread(run_financial_agent, validation_result.cleaned_input, research_result)
    yield {"event": "progress", "data": json.dumps({"step": "financial", "status": "complete", "message": "Financial Analysis Complete"})}
    
    # Recommendation
    yield {"event": "progress", "data": json.dumps({"step": "recommendation", "status": "running", "message": "Structuring Financing Strategy..."})}
    recommendation_result = await asyncio.to_thread(run_recommendation_agent, validation_result.cleaned_input, research_result, financial_result)
    yield {"event": "progress", "data": json.dumps({"step": "recommendation", "status": "complete", "message": "Financing Strategy Complete"})}
    
    # Lender
    yield {"event": "progress", "data": json.dumps({"step": "lender", "status": "running", "message": "Matching Lenders via Database..."})}
    lender_result = await asyncio.to_thread(run_lender_agent, validation_result.cleaned_input, research_result, financial_result, recommendation_result)
    yield {"event": "progress", "data": json.dumps({"step": "lender", "status": "complete", "message": "Lender Matching Complete"})}
    
    # Report Generator
    yield {"event": "progress", "data": json.dumps({"step": "report", "status": "running", "message": "Compiling 18-Section Enterprise Deal Brief..."})}
    final_report = await asyncio.to_thread(run_report_agent, validation_result.cleaned_input, research_result, financial_result, recommendation_result, lender_result)
    yield {"event": "progress", "data": json.dumps({"step": "report", "status": "complete", "message": "Deal Brief Generated"})}
    
    # Yield the final report
    yield {"event": "complete", "data": final_report.model_dump_json()}
