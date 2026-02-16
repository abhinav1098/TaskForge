from functools import lru_cache
from typing import TYPE_CHECKING
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    SECRET_KEY: str = Field(..., min_length=32)
    DATABASE_URL: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=5)

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    ENVIRONMENT: str = Field(default="development")

    # 🔥 REMOVE env_file
    model_config = SettingsConfigDict(
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    if TYPE_CHECKING:
        return Settings(
            SECRET_KEY="x" * 32,
            DATABASE_URL="postgresql://placeholder",
        )

    return Settings()
