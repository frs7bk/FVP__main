"""
أداة لإعادة تعيين قاعدة البيانات وإنشاء البنية الأولية
"""
import os
import sys
from sqlalchemy import create_engine, text, MetaData
import logging

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_database():
    """إعادة تعيين قاعدة البيانات بالكامل"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        logger.error("DATABASE_URL غير موجود في متغيرات البيئة")
        return False
    
    try:
        engine = create_engine(database_url)
        logger.info("جاري محاولة مسح قاعدة البيانات الحالية...")
        
        # محاولة مسح جميع الجداول
        meta = MetaData()
        meta.reflect(bind=engine)
        meta.drop_all(engine)
        logger.info("تم مسح جميع الجداول بنجاح")
        
        # استيراد النماذج والقاعدة
        try:
            from app import app, db
            with app.app_context():
                logger.info("جاري إنشاء الجداول من جديد...")
                db.create_all()
                logger.info("تم إنشاء جميع الجداول بنجاح")
        except Exception as e:
            logger.error(f"فشل في إنشاء الجداول من خلال Flask: {str(e)}")
            # إنشاء جداول أساسية بشكل يدوي
            try:
                logger.info("جاري إنشاء الجداول يدويًا...")
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
            except Exception as e2:
                logger.error(f"فشل في إنشاء الجداول يدويًا: {str(e2)}")
                return False
        
        return True
    except Exception as e:
        logger.error(f"فشل في إعادة تعيين قاعدة البيانات: {str(e)}")
        return False

def create_admin_user(username, email, password):
    """إنشاء مستخدم مسؤول بعد إعادة تعيين قاعدة البيانات"""
    database_url = os.environ.get('DATABASE_URL')
    engine = create_engine(database_url)
    
    try:
        # التحقق من وجود جدول المستخدم
        from sqlalchemy import inspect
        inspector = inspect(engine)
        if 'user' not in inspector.get_table_names():
            logger.error("جدول المستخدم غير موجود")
            return False
        
        # إنشاء مستخدم مسؤول
        from werkzeug.security import generate_password_hash
        engine.execute(
            text("INSERT INTO \"user\" (username, email, password_hash, is_admin, is_active) VALUES (:username, :email, :password_hash, TRUE, TRUE)"),
            {"username": username, "email": email, "password_hash": generate_password_hash(password)}
        )
        logger.info(f"تم إنشاء مستخدم مسؤول جديد: {username}")
        return True
    except Exception as e:
        logger.error(f"فشل في إنشاء المستخدم المسؤول: {str(e)}")
        return False

if __name__ == "__main__":
    print("⚠️ تحذير: سيؤدي هذا الإجراء إلى مسح جميع البيانات الحالية في قاعدة البيانات ⚠️")
    confirm = input("هل أنت متأكد أنك تريد المتابعة؟ (نعم/لا): ")
    
    if confirm.lower() not in ['y', 'yes', 'نعم']:
        print("تم إلغاء العملية")
        sys.exit(0)
    
    if reset_database():
        print("تم إعادة تعيين قاعدة البيانات بنجاح")
        
        if len(sys.argv) == 4:
            username = sys.argv[1]
            email = sys.argv[2]
            password = sys.argv[3]
            
            if create_admin_user(username, email, password):
                print(f"تم إنشاء المستخدم المسؤول: {username}")
                print(f"يمكنك الآن تسجيل الدخول باستخدام: {email} / {password}")
                sys.exit(0)
            else:
                print("فشل في إنشاء المستخدم المسؤول")
                sys.exit(1)
        else:
            print("لم يتم تقديم معلومات المستخدم المسؤول")
            print("الاستخدام: python reset_db.py <username> <email> <password>")
            sys.exit(0)
    else:
        print("فشل في إعادة تعيين قاعدة البيانات")
        sys.exit(1)