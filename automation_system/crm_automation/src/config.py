"""
إعدادات التطبيق
"""
import os
from dotenv import load_dotenv
from pathlib import Path
from typing import Dict, Any, List, Optional
from pydantic import BaseSettings, PostgresDsn, validator, HttpUrl

# تحميل المتغيرات البيئية
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    # إعدادات التطبيق
    APP_NAME: str = "نظام متابعة العملاء"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # إعدادات قاعدة البيانات
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/crm_db")
    
    # إعدادات البريد الإلكتروني
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@example.com")
    
    # إعدادات التكامل مع أنظمة CRM
    HUBSPOT_API_KEY: Optional[str] = os.getenv("HUBSPOT_API_KEY")
    SALESFORCE_CLIENT_ID: Optional[str] = os.getenv("SALESFORCE_CLIENT_ID")
    SALESFORCE_CLIENT_SECRET: Optional[str] = os.getenv("SALESFORCE_CLIENT_SECRET")
    
    # إعدادات الإشعارات
    TELEGRAM_BOT_TOKEN: Optional[str] = os.getenv("TELEGRAM_BOT_TOKEN")
    TELEGRAM_CHAT_ID: Optional[str] = os.getenv("TELEGRAM_CHAT_ID")
    
    # إعدادات المتابعة
    FOLLOW_UP_DAYS: List[int] = [int(x) for x in os.getenv("FOLLOW_UP_DAYS", "1,3,7,14,30").split(",")]
    MAX_FOLLOW_UPS: int = int(os.getenv("MAX_FOLLOW_UPS", "5"))
    
    # إعدادات تحليل المشاعر
    ENABLE_SENTIMENT_ANALYSIS: bool = os.getenv("ENABLE_SENTIMENT_ANALYSIS", "True").lower() in ("true", "1", "t")
    SENTIMENT_ANALYSIS_MODEL: str = os.getenv("SENTIMENT_ANALYSIS_MODEL", "cardiffnlp/twitter-xlm-roberta-base-sentiment")
    
    # إعدادات الذكاء الاصطناعي
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    ENABLE_AI_SUGGESTIONS: bool = os.getenv("ENABLE_AI_SUGGESTIONS", "True").lower() in ("true", "1", "t")
    
    # إعدادات الأداء
    WORKERS: int = int(os.getenv("WORKERS", "4"))
    MAX_CONCURRENT_TASKS: int = int(os.getenv("MAX_CONCURRENT_TASKS", "10"))
    
    # التحقق من صحة إعدادات قاعدة البيانات
    @validator("DATABASE_URL")
    def validate_database_url(cls, v: str) -> str:
        if not v.startswith(("postgresql://", "postgres://")):
            raise ValueError("يجب أن يبدأ رابط قاعدة البيانات بـ postgresql:// أو postgres://")
        return v
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

# إنشاء نسخة من الإعدادات
settings = Settings()

# تصدير الإعدادات
__all__ = ["settings"]
