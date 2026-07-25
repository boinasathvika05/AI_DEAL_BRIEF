from abc import ABC, abstractmethod
from typing import Type
from pydantic import BaseModel

class LLMProvider(ABC):
    @abstractmethod
    def generate_structured_response(self, system_prompt: str, user_prompt: str, response_schema: Type[BaseModel]) -> BaseModel:
        """Generates a structured response based on the prompt and schema."""
        pass

    @abstractmethod
    def verify_health(self) -> bool:
        """Verifies API key and model availability."""
        pass
