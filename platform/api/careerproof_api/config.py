from __future__ import annotations

from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "platform/.env"),
        env_prefix="CAREERPROOF_",
        extra="ignore",
    )

    environment: str = "development"
    database_url: str = "sqlite:///./careerproof-dev.db"
    jwt_secret: str = "change-this-secret-before-production-use"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24
    auto_migrate: bool = True
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    max_upload_bytes: int = 12 * 1024 * 1024
    provider_config_json: str = "{}"
    default_workspace_plan: str = "free"

    @model_validator(mode="after")
    def reject_default_production_secret(self) -> Settings:
        if self.environment == "production" and self.jwt_secret == "change-this-secret-before-production-use":
            raise ValueError("CAREERPROOF_JWT_SECRET must be replaced in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
