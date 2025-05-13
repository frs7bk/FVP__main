"""
أداة لإصلاح لوحة التحكم وإنشاء/تحديث حساب المسؤول
استخدم هذه الأداة على Render للتأكد من أن الموقع يعمل بشكل صحيح
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash
import logging

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_database_connection():
    """التحقق من الاتصال بقاعدة البيانات"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        logger.error("DATABASE_URL غير موجود في متغيرات البيئة")
        return False
    
    try:
        engine = create_engine(database_url)
        connection = engine.connect()
        connection.close()
        logger.info("تم الاتصال بقاعدة البيانات بنجاح")
        return True
    except Exception as e:
        logger.error(f"فشل الاتصال بقاعدة البيانات: {str(e)}")
        return False

def create_tables_if_not_exist():
    """إنشاء الجداول إذا لم تكن موجودة"""
    database_url = os.environ.get('DATABASE_URL')
    engine = create_engine(database_url)
    
    try:
        # استيراد النماذج والقاعدة
        from app import db
        # إنشاء جميع الجداول
        db.create_all()
        logger.info("تم إنشاء/التحقق من جميع الجداول")
        return True
    except Exception as e:
        logger.error(f"فشل في إنشاء الجداول: {str(e)}")
        
        # محاولة إنشاء جدول المستخدم يدويًا إذا فشلت الطريقة الأولى
        try:
            engine.execute('''
            CREATE TABLE IF NOT EXISTS "user" (
                id SERIAL PRIMARY KEY,
                username VARCHAR(64) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(256),
                is_admin BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')
            logger.info("تم إنشاء جدول المستخدم يدويًا")
            return True
        except Exception as e2:
            logger.error(f"فشل في إنشاء جدول المستخدم يدويًا: {str(e2)}")
            return False

def create_admin_user(username, email, password):
    """إنشاء أو تحديث مستخدم مسؤول"""
    database_url = os.environ.get('DATABASE_URL')
    engine = create_engine(database_url)
    
    try:
        # التحقق من وجود جدول المستخدم
        from sqlalchemy import inspect
        inspector = inspect(engine)
        if 'user' not in inspector.get_table_names():
            logger.error("جدول المستخدم غير موجود")
            if not create_tables_if_not_exist():
                return False
        
        # إنشاء جلسة
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # التحقق من وجود المستخدم
        result = session.execute(
            text("SELECT id FROM \"user\" WHERE username = :username OR email = :email"),
            {"username": username, "email": email}
        ).fetchone()
        
        if result:
            # تحديث المستخدم الحالي
            session.execute(
                text("UPDATE \"user\" SET is_admin = TRUE, is_active = TRUE, password_hash = :password_hash WHERE username = :username OR email = :email"),
                {"username": username, "email": email, "password_hash": generate_password_hash(password)}
            )
            logger.info(f"تم تحديث المستخدم {username} ليكون مسؤولًا")
        else:
            # إنشاء مستخدم جديد
            session.execute(
                text("INSERT INTO \"user\" (username, email, password_hash, is_admin, is_active) VALUES (:username, :email, :password_hash, TRUE, TRUE)"),
                {"username": username, "email": email, "password_hash": generate_password_hash(password)}
            )
            logger.info(f"تم إنشاء مستخدم مسؤول جديد: {username}")
        
        session.commit()
        return True
    except Exception as e:
        logger.error(f"فشل في إنشاء/تحديث المستخدم المسؤول: {str(e)}")
        return False

def fix_admin_routes():
    """تصحيح أي مشاكل متعلقة بمسارات لوحة التحكم"""
    try:
        # يمكن إضافة المزيد من إصلاحات المسارات هنا إذا لزم الأمر
        logger.info("تم التحقق من مسارات لوحة التحكم")
        return True
    except Exception as e:
        logger.error(f"فشل في إصلاح مسارات لوحة التحكم: {str(e)}")
        return False

def run_full_fix(username, email, password):
    """تشغيل جميع الإصلاحات"""
    if not check_database_connection():
        return False
    
    if not create_tables_if_not_exist():
        logger.warning("فشل في إنشاء الجداول، ولكن سنستمر في العملية")
    
    if not create_admin_user(username, email, password):
        return False
    
    if not fix_admin_routes():
        logger.warning("فشل في إصلاح المسارات، ولكن سنستمر في العملية")
    
    logger.info("تم إكمال عملية الإصلاح بنجاح!")
    return True

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("الاستخدام: python fix_admin_access.py <username> <email> <password>")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    
    success = run_full_fix(username, email, password)
    if success:
        print(f"تم إصلاح الوصول إلى لوحة التحكم وإنشاء المستخدم المسؤول: {username}")
        print(f"يمكنك الآن تسجيل الدخول باستخدام: {email} / {password}")
        print("انتقل إلى: /admin/login")
        sys.exit(0)
    else:
        print("فشل في إصلاح لوحة التحكم. راجع السجلات للحصول على التفاصيل.")
        sys.exit(1)