"""
سكريبت لتحديث قاعدة البيانات وإضافة الأعمدة المفقودة
"""
from app import app
import logging
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import sqlite3
import sys
from sqlalchemy import text, inspect

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_path():
    """الحصول على مسار قاعدة البيانات من متغيرات البيئة"""
    db_url = os.environ.get("DATABASE_URL")
    
    if not db_url:
        # استخدام قاعدة بيانات SQLite الافتراضية
        return "instance/website.db"
    
    # يمكن إضافة منطق هنا للتعامل مع PostgreSQL وقواعد البيانات الأخرى
    # في هذه الحالة نعود إلى SQLite
    return "instance/website.db"

def add_missing_columns():
    """إضافة الأعمدة المفقودة إلى جدول portfolio_item"""
    try:
        db_path = get_db_path()
        logger.info(f"مسار قاعدة البيانات: {db_path}")
        
        # التحقق من وجود قاعدة البيانات
        if not os.path.exists(db_path):
            logger.error(f"قاعدة البيانات غير موجودة: {db_path}")
            return False
        
        # فتح اتصال بقاعدة البيانات
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # التحقق من وجود العمود
        cursor.execute("PRAGMA table_info(portfolio_item);")
        columns = [col[1] for col in cursor.fetchall()]
        logger.info(f"الأعمدة الموجودة: {columns}")
        
        # إضافة العمود إذا كان غير موجود
        columns_to_add = {
            'video_url': 'TEXT',
            'video_file': 'TEXT',
            'video_type': 'TEXT',
            'video_thumbnail': 'TEXT'
        }
        
        for col_name, col_type in columns_to_add.items():
            if col_name not in columns:
                logger.info(f"إضافة العمود المفقود: {col_name}")
                cursor.execute(f"ALTER TABLE portfolio_item ADD COLUMN {col_name} {col_type};")
                conn.commit()
            else:
                logger.info(f"العمود موجود بالفعل: {col_name}")
        
        # الانتهاء من الاتصال
        conn.close()
        logger.info("تم تحديث قاعدة البيانات بنجاح")
        return True
    
    except Exception as e:
        logger.error(f"حدث خطأ أثناء تحديث قاعدة البيانات: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    with app.app_context():
        add_missing_columns()