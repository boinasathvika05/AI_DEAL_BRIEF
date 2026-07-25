import os
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'), override=True)

# API Keys
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY", "")
SERPER_API_KEY = os.environ.get("SERPER_API_KEY", "")

# Active Providers
ACTIVE_LLM_PROVIDER = os.environ.get("ACTIVE_LLM_PROVIDER", "gemini") # gemini, openai, claude, groq
ACTIVE_SEARCH_PROVIDER = os.environ.get("ACTIVE_SEARCH_PROVIDER", "tavily") # tavily, serper, duckduckgo

# Gemini Configuration
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-lite-latest")
ALLOW_PREVIEW_MODELS = os.environ.get("ALLOW_PREVIEW_MODELS", "false").lower() == "true"
AUTO_SELECT_MODEL = os.environ.get("AUTO_SELECT_MODEL", "true").lower() == "true"
