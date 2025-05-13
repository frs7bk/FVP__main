"""
أداة لإنشاء مستخدم مسؤول مباشرة في قاعدة البيانات
استخدم هذه الأداة على Render من خلال أداة Shell لإصلاح مشكلة عدم القدرة على الوصول إلى لوحة التحكم
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from werkzeug.security import generate_password_hash
import sys
import logging

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_admin_user(username, email, password):
    """إنشاء مستخدم مسؤول جديد مباشرة في قاعدة البيانات"""
    
    try:
        # الحصول على رابط قاعدة البيانات من متغيرات البيئة
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            logger.error("DATABASE_URL غير موجود في متغيرات البيئة")
            return False
        
        # إنشاء محرك قاعدة البيانات
        engine = create_engine(database_url)
        
        # التأكد من وجود الجداول المطلوبة
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if 'user' not in inspector.get_table_names():
            logger.error("جدول المستخدمين غير موجود في قاعدة البيانات")
            return False
        
        # التحقق من أعمدة الجدول
        columns = [column['name'] for column in inspector.get_columns('user')]
        required_columns = ['username', 'email', 'password_hash', 'is_admin', 'is_active']
        for col in required_columns:
            if col not in columns:
                logger.error(f"العمود {col} غير موجود في جدول المستخدمين")
                return False
        
        # إنشاء جلسة
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # التحقق مما إذا كان المستخدم موجودًا بالفعل
        result = session.execute(
            text("SELECT id FROM \"user\" WHERE username = :username OR email = :email"),
            {"username": username, "email": email}
        ).fetchone()
        
        if result:
            # تحديث المستخدم الحالي ليكون مسؤولًا
            session.execute(
                text("UPDATE \"user\" SET is_admin = TRUE, is_active = TRUE, password_hash = :password_hash WHERE username = :username OR email = :email"),
                {"username": username, "email": email, "password_hash": generate_password_hash(password)}
            )
            logger.info(f"تم تحديث المستخدم {username} ليكون مسؤولًا")
        else:
            # إنشاء مستخدم مسؤول جديد
            session.execute(
                text("INSERT INTO \"user\" (username, email, password_hash, is_admin, is_active) VALUES (:username, :email, :password_hash, TRUE, TRUE)"),
                {"username": username, "email": email, "password_hash": generate_password_hash(password)}
            )
            logger.info(f"تم إنشاء مستخدم مسؤول جديد: {username}")
        
        # حفظ التغييرات
        session.commit()
        logger.info("تم حفظ التغييرات بنجاح")
        return True
        
    except Exception as e:
        logger.error(f"حدث خطأ أثناء إنشاء المستخدم المسؤول: {str(e)}")
        return False
    finally:
        if 'session' in locals():
            session.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("الاستخدام: python create_admin_direct.py <username> <email> <password>")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    
    success = create_admin_user(username, email, password)
    if success:
        print(f"تم إنشاء/تحديث المستخدم المسؤول بنجاح: {username}")
        sys.exit(0)
    else:
        print("فشل في إنشاء/تحديث المستخدم المسؤول")
        sys.exit(1)