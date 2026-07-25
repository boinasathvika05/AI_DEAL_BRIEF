import os
from pydantic import BaseModel
from typing import Type
from tenacity import retry, wait_exponential, stop_after_attempt
from config import ACTIVE_LLM_PROVIDER
from utils.gemini_provider import GeminiProvider

# Initialize active provider singleton
provider = None
if ACTIVE_LLM_PROVIDER == "gemini":
    provider = GeminiProvider()
elif ACTIVE_LLM_PROVIDER == "openai":
    # Placeholder for OpenAIProvider adhering to LLMProvider interface
    pass

@retry(
    wait=wait_exponential(multiplier=2, min=5, max=60),
    stop=stop_after_attempt(10),
    reraise=True
)
def generate_structured_response(system_prompt: str, user_prompt: str, response_schema: Type[BaseModel]) -> BaseModel:
    """
    Generates a structured response using the active AI provider.
    Includes exponential backoff for rate limits.
    """
    if not provider:
        raise ValueError(f"Provider {ACTIVE_LLM_PROVIDER} is not initialized or unsupported.")
        
    print(f"Generating structured response using {ACTIVE_LLM_PROVIDER}...")
    return provider.generate_structured_response(system_prompt, user_prompt, response_schema)
