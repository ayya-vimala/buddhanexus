"""
This file contains all FastAPI endpoints for Buddhanexus.
"""

import os
import json
import logging

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.coder import JsonCoder
from redis import asyncio as aioredis
from .cache_config import make_cache_key_builder, CustomJsonCoder
from .endpoints import (
    search,
    table_view,
    text_view,
    numbers_view,
    graph_view,
    menu,
    utils,
    links,
    download,
)
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

API_PREFIX = "/api-db" if os.environ["PROD"] == "1" else "/api-db"

APP = FastAPI(title="BuddhaNexus Backend", version="0.2.1", openapi_prefix=API_PREFIX)

APP.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

class CacheControlMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if request.method == "GET":
            response.headers["Cache-Control"] = "public, max-age=864000"
            response.headers["Vary"] = "Accept-Encoding"
        return response

APP.add_middleware(CacheControlMiddleware)
APP.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*", "Cache-Control"],
    expose_headers=["Cache-Control"]
)

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    force=True
)

# Create logger for this module
logger = logging.getLogger(__name__)

# Initialize cache on startup
@APP.on_event("startup")
async def startup():
    logger.info("Initializing FastAPI application...")
    redis = aioredis.from_url(
        "redis://redis:6379",
        encoding="utf8",
        decode_responses=False
    )
    FastAPICache.init(
        backend=RedisBackend(redis),
        prefix="buddhanexus-cache",
        key_builder=make_cache_key_builder(),
        coder=CustomJsonCoder()
    )
    logger.info("Cache initialized")

APP.include_router(search.router)
APP.include_router(graph_view.router)
APP.include_router(download.router)
APP.include_router(table_view.router, prefix="/table-view")
APP.include_router(text_view.router, prefix="/text-view")
APP.include_router(numbers_view.router, prefix="/numbers-view")
APP.include_router(links.router, prefix="/links")
APP.include_router(utils.router, prefix="/utils")
APP.include_router(menu.router)

# Add a test endpoint to verify logging
@APP.get("/test-log")
async def test_log():
    logger.info("Test log endpoint called")
    return {"message": "Logged successfully"}

@APP.get("/")
def root() -> object:
    """
    Root API endpoint
    :return: The response (json object)
    """
    return {"message": "Visit /docs to view the documentation"}

# Add this to help debug caching issues
# @APP.middleware("http")
# async def add_cache_header(request, call_next):
#     response = await call_next(request)
#     if "menudata" in request.url.path:
#         # Generate cache key without function reference
#         cache_key = make_cache_key_builder()(
#             func={"module": "api.endpoints.menu", "name": "get_data_for_sidebar_menu"},
#             namespace="api",
#             **dict(request.query_params)
#         )
#         response.headers["X-Cache-Key"] = cache_key
#     return response
