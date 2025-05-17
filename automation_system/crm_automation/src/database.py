"""
وحدة قاعدة البيانات
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, scoped_session
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager

from .config import settings

# إعداد التسجيل
logger = logging.getLogger(__name__)

# إنشاء محرك قاعدة البيانات
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=settings.WORKERS,
    max_overflow=10,
    connect_args={"connect_timeout": 10}
)

# جلسة قاعدة البيانات
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# نموذج قاعدة البيانات
Base = declarative_base()

class Lead(Base):
    """نموذج العميل المحتمل"""
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50))
    company = Column(String(255))
    job_title = Column(String(255))
    status = Column(String(50), default="new")  # new, contacted, qualified, converted, lost
    source = Column(String(100))  # website, referral, social_media, etc.
    score = Column(Integer, default=0)  # درجة جودة العميل
    last_contact_date = Column(DateTime, default=datetime.utcnow)
    next_follow_up = Column(DateTime)
    follow_up_count = Column(Integer, default=0)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    interactions = relationship("Interaction", back_populates="lead", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="lead", cascade="all, delete-orphan")

class Interaction(Base):
    """نموذج تفاعلات العملاء"""
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    interaction_type = Column(String(50))  # email, call, meeting, etc.
    direction = Column(String(20))  # inbound, outbound
    subject = Column(String(255))
    content = Column(Text)
    sentiment_score = Column(Float)  # -1 (سلبي) إلى 1 (إيجابي)
    sentiment_label = Column(String(20))  # positive, negative, neutral
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # العلاقات
    lead = relationship("Lead", back_populates="interactions")

class Task(Base):
    """نموذج المهام"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    due_date = Column(DateTime)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, cancelled
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    assigned_to = Column(String(100))  # يمكن أن يكون معرف المستخدم
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    lead = relationship("Lead", back_populates="tasks")

@contextmanager
def get_db():
    """الحصول على جلسة قاعدة البيانات"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"خطأ في قاعدة البيانات: {str(e)}")
        raise
    finally:
        db.close()

def init_db():
    """تهيئة قاعدة البيانات"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("تم إنشاء جداول قاعدة البيانات بنجاح")
    except SQLAlchemyError as e:
        logger.error(f"فشل إنشاء جداول قاعدة البيانات: {str(e)}")
        raise

# تصدير النماذج
__all__ = ["Lead", "Interaction", "Task", "get_db", "init_db"]
