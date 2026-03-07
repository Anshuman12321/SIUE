"""
SIUE Backend — FastAPI Entry Point
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize on startup."""
    print("[SERVER] SIUE backend ready")
    yield


app = FastAPI(
    title="SIUE API",
    description="SIUE Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/")
async def home():
    return {"message": "SIUE Backend API"}
