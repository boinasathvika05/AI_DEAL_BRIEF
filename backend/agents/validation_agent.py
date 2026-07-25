from schemas.models import DealInput, ValidationResult
from utils.llm import generate_structured_response
from prompts.agent_prompts import VALIDATION_SYSTEM_PROMPT
import json

def run_validation_agent(deal_input: DealInput) -> ValidationResult:
    user_prompt = f"Please validate the following deal input:\n{deal_input.model_dump_json()}"
    
    result = generate_structured_response(
        system_prompt=VALIDATION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema=ValidationResult
    )
    
    return result
