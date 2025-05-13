"""
إصلاح الأعمدة المفقودة في جداول قاعدة البيانات وضمان الوصول إلى لوحة الإحصائيات
"""
import os
import sys
import logging
import traceback
from sqlalchemy import create_engine, inspect, Column, Integer, String, Boolean, Text, ForeignKey, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base = declarative_base()

# تحديد نماذج قاعدة البيانات الأساسية للتحقق منها
class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(256))
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PortfolioItem(Base):
    __tablename__ = 'portfolio_item'
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    image_url = Column(String(255))
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class PortfolioComment(Base):
    __tablename__ = 'portfolio_comment'
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'))
    portfolio_id = Column(Integer, ForeignKey('portfolio_item.id'))
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class UserActivity(Base):
    __tablename__ = 'user_activity'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    activity_type = Column(String(50), nullable=False)
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class PortfolioLike(Base):
    __tablename__ = 'portfolio_like'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    portfolio_id = Column(Integer, ForeignKey('portfolio_item.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

class CommentLike(Base):
    __tablename__ = 'comment_like'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    comment_id = Column(Integer, ForeignKey('portfolio_comment.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

class Visitor(Base):
    __tablename__ = 'visitor'
    id = Column(Integer, primary_key=True)
    visitor_id = Column(String(128), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    ip_address = Column(String(45))
    user_agent = Column(String(255))
    first_visit = Column(DateTime, default=datetime.utcnow)
    last_visit = Column(DateTime, default=datetime.utcnow)
    visit_count = Column(Integer, default=1)
    
class PageVisit(Base):
    __tablename__ = 'page_visit'
    id = Column(Integer, primary_key=True)
    visitor_id = Column(Integer, ForeignKey('visitor.id'))
    page_url = Column(String(255), nullable=False)
    page_title = Column(String(255))
    referrer = Column(String(255))
    visited_at = Column(DateTime, default=datetime.utcnow)

def check_database_connection(database_url=None):
    """التحقق من الاتصال بقاعدة البيانات"""
    if database_url is None:
        database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        logger.error("DATABASE_URL غير موجود في متغيرات البيئة")
        return None
    
    try:
        engine = create_engine(database_url)
        connection = engine.connect()
        connection.close()
        logger.info("تم الاتصال بقاعدة البيانات بنجاح")
        return engine
    except Exception as e:
        logger.error(f"فشل الاتصال بقاعدة البيانات: {str(e)}")
        return None

def check_tables_and_columns(engine):
    """التحقق من وجود جميع الجداول والأعمدة المطلوبة"""
    inspector = inspect(engine)
    all_tables = inspector.get_table_names()
    
    logger.info(f"الجداول الموجودة في قاعدة البيانات: {all_tables}")
    
    expected_tables = [
        'user', 'portfolio_item', 'portfolio_comment', 'user_activity',
        'portfolio_like', 'comment_like', 'visitor', 'page_visit'
    ]
    
    missing_tables = [table for table in expected_tables if table not in all_tables]
    if missing_tables:
        logger.warning(f"الجداول المفقودة: {missing_tables}")
    else:
        logger.info("جميع الجداول المتوقعة موجودة")
    
    # التحقق من وجود الأعمدة المطلوبة في الجداول الموجودة
    missing_columns = {}
    for table in expected_tables:
        if table in all_tables:
            columns = inspector.get_columns(table)
            column_names = [col['name'] for col in columns]
            
            # التحقق من النموذج المقابل للجدول
            model_class = globals().get(get_model_class_name(table))
            if model_class:
                expected_columns = [column.key for column in model_class.__table__.columns]
                missing = [col for col in expected_columns if col not in column_names]
                if missing:
                    missing_columns[table] = missing
                    logger.warning(f"الأعمدة المفقودة في جدول {table}: {missing}")
    
    return missing_tables, missing_columns

def get_model_class_name(table_name):
    """الحصول على اسم فئة النموذج بناءً على اسم الجدول"""
    mapping = {
        'user': 'User',
        'portfolio_item': 'PortfolioItem',
        'portfolio_comment': 'PortfolioComment',
        'user_activity': 'UserActivity',
        'portfolio_like': 'PortfolioLike',
        'comment_like': 'CommentLike',
        'visitor': 'Visitor',
        'page_visit': 'PageVisit'
    }
    return mapping.get(table_name)

def create_missing_tables(engine, missing_tables):
    """إنشاء الجداول المفقودة"""
    if not missing_tables:
        return True
    
    try:
        # إنشاء الجداول المفقودة
        metadata = Base.metadata
        tables_to_create = [getattr(metadata.tables, table) for table in missing_tables]
        metadata.create_all(engine, tables=tables_to_create)
        logger.info(f"تم إنشاء الجداول المفقودة: {missing_tables}")
        return True
    except Exception as e:
        logger.error(f"فشل في إنشاء الجداول المفقودة: {str(e)}")
        traceback.print_exc()
        return False

def add_missing_columns(engine, missing_columns):
    """إضافة الأعمدة المفقودة"""
    if not missing_columns:
        return True
    
    try:
        # إضافة الأعمدة المفقودة
        connection = engine.connect()
        for table, columns in missing_columns.items():
            for column in columns:
                model_class = globals().get(get_model_class_name(table))
                if model_class:
                    col_obj = getattr(model_class, column, None)
                    if col_obj is not None:
                        column_type = get_column_type_sql(col_obj.type)
                        sql = f"ALTER TABLE {table} ADD COLUMN {column} {column_type}"
                        logger.info(f"تنفيذ استعلام SQL: {sql}")
                        try:
                            connection.execute(sql)
                            logger.info(f"تم إضافة العمود {column} إلى جدول {table}")
                        except Exception as e:
                            logger.error(f"فشل في إضافة العمود {column} إلى جدول {table}: {str(e)}")
        
        connection.close()
        return True
    except Exception as e:
        logger.error(f"فشل في إضافة الأعمدة المفقودة: {str(e)}")
        traceback.print_exc()
        return False

def get_column_type_sql(column_type):
    """تحويل نوع العمود في SQLAlchemy إلى نوع SQL"""
    type_name = column_type.__class__.__name__.lower()
    
    type_mappings = {
        'integer': 'INTEGER',
        'string': 'VARCHAR',
        'text': 'TEXT',
        'boolean': 'BOOLEAN',
        'datetime': 'TIMESTAMP',
        'float': 'FLOAT'
    }
    
    if type_name in type_mappings:
        sql_type = type_mappings[type_name]
        if type_name == 'string' and hasattr(column_type, 'length'):
            sql_type = f"{sql_type}({column_type.length})"
        return sql_type
    
    return 'VARCHAR'  # نوع افتراضي

def fix_database():
    """إصلاح كامل لقاعدة البيانات"""
    # الحصول على معلومات الاتصال بقاعدة البيانات
    engine = check_database_connection()
    if engine is None:
        logger.error("تعذر الاتصال بقاعدة البيانات")
        return False
    
    # التحقق من الجداول والأعمدة
    missing_tables, missing_columns = check_tables_and_columns(engine)
    
    # إنشاء الجداول المفقودة
    if missing_tables:
        if not create_missing_tables(engine, missing_tables):
            logger.error("فشل في إصلاح الجداول المفقودة")
            return False
    
    # إضافة الأعمدة المفقودة
    if missing_columns:
        if not add_missing_columns(engine, missing_columns):
            logger.error("فشل في إصلاح الأعمدة المفقودة")
            return False
    
    logger.info("تم إصلاح قاعدة البيانات بنجاح")
    return True

if __name__ == "__main__":
    try:
        success = fix_database()
        if success:
            print("تم إصلاح قاعدة البيانات بنجاح!")
            sys.exit(0)
        else:
            print("فشل في إصلاح قاعدة البيانات. يرجى مراجعة السجلات.")
            sys.exit(1)
    except Exception as e:
        logger.error(f"خطأ غير متوقع: {str(e)}")
        traceback.print_exc()
        sys.exit(1)