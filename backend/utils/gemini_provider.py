import os
import sys
from typing import Type, List, Optional
from pydantic import BaseModel
from google import genai
from google.genai import types
from google.genai.errors import APIError
from utils.llm_provider import LLMProvider
from config import GEMINI_API_KEY, GEMINI_MODEL, ALLOW_PREVIEW_MODELS, AUTO_SELECT_MODEL

class GeminiProvider(LLMProvider):
    def __init__(self):
        if not GEMINI_API_KEY:
            print("Gemini Status: Unavailable (No API Key)")
            self.client = None
            self.active_model = None
            return
            
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.active_model = self._select_model()

    def _select_model(self) -> Optional[str]:
        print("\n--- Gemini Provider Initialization ---")
        try:
            import google.genai as genai_pkg
            print(f"Gemini SDK Version: {genai_pkg.__version__}")
        except Exception:
            print("Gemini SDK Version: Unknown (google-genai)")
            
        print(f"Configured Model: {GEMINI_MODEL}")
        
        try:
            # Fetch all models
            model_pager = self.client.models.list()
            all_models = [m for m in model_pager]
            
            # Filter models
            stable_generate_models = []
            for m in all_models:
                name = m.name.replace("models/", "")
                
                # Check supports generateContent
                supports_generate = False
                if m.supported_actions:
                    supports_generate = "generateContent" in m.supported_actions
                
                # Exclude unwanted types
                is_experimental = "experimental" in name or "exp" in name
                is_embedding = "embedding" in name
                is_audio = "audio" in name or "tts" in name or "aqa" in name
                is_vision = "vision" in name
                is_preview = "preview" in name
                
                if supports_generate and not is_embedding and not is_audio and not is_vision:
                    if is_experimental: continue
                    if is_preview and not ALLOW_PREVIEW_MODELS: continue
                    stable_generate_models.append(name)
            
            print(f"Available Stable Models: {stable_generate_models}")
            
            # Check if configured model is available
            configured_base = GEMINI_MODEL.replace("models/", "")
            if configured_base in stable_generate_models:
                print(f"Selected Model: {configured_base}")
                return configured_base
                
            if not AUTO_SELECT_MODEL:
                print(f"Fallback Reason: Configured model '{configured_base}' unavailable and AUTO_SELECT_MODEL is false.")
                print("Gemini Status: Unavailable")
                return None
                
            print(f"Fallback Reason: Configured model '{configured_base}' is unavailable.")
            
            # Priority Queue
            priority = [
                "gemini-2.5-flash",
                "gemini-2.5-flash-lite",
                "gemini-2.0-flash",
                "gemini-2.0-flash-lite",
                "gemini-1.5-flash"
            ]
            
            for p in priority:
                if p in stable_generate_models:
                    print(f"Selected Model: {p} (Auto-Selected via Priority)")
                    return p
                    
            # Ultimate Fallback
            if stable_generate_models:
                fallback = stable_generate_models[0]
                print(f"Selected Model: {fallback} (Auto-Selected First Available)")
                return fallback
                
            print("Gemini Status: Unavailable (No compatible models found)")
            return None
                
        except Exception as e:
            print(f"Error fetching Gemini models: {e}")
            print("Gemini Status: Unavailable")
            return None

    def verify_health(self) -> bool:
        if not self.client or not self.active_model:
            print("Gemini Status: Unavailable")
            return False
            
        try:
            response = self.client.models.generate_content(
                model=self.active_model,
                contents="Return OK",
            )
            if response.text and "OK" in response.text.upper():
                print("Gemini Status: Healthy")
                return True
            else:
                print(f"Gemini Status: Unavailable (Unexpected response: {response.text})")
                return False
        except APIError as e:
            print(f"Gemini Status: Unavailable (API Error: {e.code} - {e.message})")
            return False
        except Exception as e:
            print(f"Gemini Status: Unavailable (Error: {str(e)})")
            return False

    def generate_structured_response(self, system_prompt: str, user_prompt: str, response_schema: Type[BaseModel]) -> BaseModel:
        if not self.client or not self.active_model:
            raise ValueError("Gemini is not correctly configured or unavailable.")
            
        try:
            response = self.client.models.generate_content(
                model=self.active_model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    response_schema=response_schema,
                    temperature=0.2,
                ),
            )
            if response.parsed:
                return response.parsed
            else:
                return response_schema.model_validate_json(response.text)
                
        except APIError as e:
            code = e.code
            msg = e.message
            if code == 404:
                raise ValueError(f"Gemini Model Not Found (404): The selected model '{self.active_model}' is unavailable.")
            elif code == 429:
                raise RuntimeError(f"Gemini Rate Limit Exceeded (429): {msg}")
            elif code in (401, 403):
                raise PermissionError(f"Gemini Authentication/Permission Error ({code}): {msg}")
            elif code >= 500:
                raise RuntimeError(f"Gemini Internal Server Error ({code}): {msg}")
            else:
                raise RuntimeError(f"Gemini API Error {code}: {msg}")
        except Exception as e:
            raise RuntimeError(f"Failed to generate structured response from Gemini: {str(e)}")
