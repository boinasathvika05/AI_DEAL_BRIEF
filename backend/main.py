from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api.routes import router
from dotenv import load_dotenv
import os

# Load environment variables from the root .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'), override=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Verify Provider Health
    print("Starting Application...")
    from utils.llm import provider
    if provider:
        provider.verify_health()
    else:
        print("Warning: No LLM Provider configured.")
    yield
    # Shutdown logic if any
    print("Shutting down Application...")

app = FastAPI(title="AI Deal Brief Machine API", lifespan=lifespan)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "healthy"}
