from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SDMS Backend"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    PAYMENT_SECRET_KEY: str

    # Google Gemini API
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()