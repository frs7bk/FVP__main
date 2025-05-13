#!/usr/bin/env python3
"""
إنشاء حزمة كاملة للنشر على منصة Render
يقوم بتجميع جميع الملفات الضرورية مع الإصلاحات الجديدة
"""
import os
import sys
import zipfile
import datetime
import shutil
import logging
from glob import glob

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# اسم الملف الناتج
OUTPUT_ZIP = "portfolio_render_ready.zip"

# الملفات الأساسية للنشر
ESSENTIAL_FILES = [
    "main.py", 
    "app.py", 
    "database.py", 
    "models.py",
    "check_db.py",
    "render.yaml", 
    "render-requirements.txt", 
    "render_setup.py", 
    "test_database_connection.py",
    "RENDER_DEPLOYMENT.md",
    "README.md",
    "fix_admin_access.py",
    "fix_analytics_routes.py",
    "fix_db_missing_columns.py",
    "portfolio_routes.py",
    "telegram_test_routes.py",
    "auth_routes.py",
    "live_visitors.py",
    ".gitignore"
]

# الإصلاحات الجديدة
FIXES = [
    "static/js/enhanced-video-stop-manager.js",
    "static/js/simple-video-btn.js",
    "templates/includes/portfolio_modal.html",
    "fix_analytics_routes.py",
    "fix_db_missing_columns.py"
]

# المجلدات التي يجب نسخها بالكامل
FOLDERS_TO_INCLUDE = [
    "static/css",
    "static/js",
    "static/img",
    "static/vendor",
    "templates",
    "instance"
]

# الملفات التي يجب استبعادها
EXCLUDED_PATTERNS = [
    "/__pycache__/",
    "/.git/",
    "/.venv/",
    "/.env",
    ".pyc",
    ".pyo",
    ".DS_Store",
    "/.pytest_cache/",
    "/tests/",
    "/upload_test/",
    "/tmp/",
    "/temp/",
    "/database.db",
    "/instance/database.db",
    "/*.zip"
]

def should_exclude(path):
    """التحقق مما إذا كان ينبغي استبعاد المسار"""
    path = os.path.normpath(path)
    
    for pattern in EXCLUDED_PATTERNS:
        if pattern in path:
            return True
    return False

def create_deployment_zip():
    """إنشاء ملف ZIP جاهز للنشر على Render"""
    try:
        logger.info(f"جاري إنشاء حزمة متكاملة للنشر على Render...")
        
        # التحقق من وجود الملفات الأساسية
        missing_files = []
        for file in ESSENTIAL_FILES:
            if not os.path.exists(file):
                missing_files.append(file)
        
        if missing_files:
            logger.warning(f"⚠️ الملفات التالية مفقودة: {', '.join(missing_files)}")
        
        # إنشاء ملف ZIP
        with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # إضافة الملفات الأساسية
            for file in ESSENTIAL_FILES:
                if os.path.exists(file):
                    zipf.write(file)
                    logger.info(f"✓ تمت إضافة: {file}")
            
            # إضافة الإصلاحات الجديدة
            for fix in FIXES:
                if os.path.exists(fix):
                    zipf.write(fix)
                    logger.info(f"✓ تمت إضافة الإصلاح: {fix}")
                else:
                    logger.warning(f"⚠️ ملف الإصلاح غير موجود: {fix}")
            
            # إضافة المجلدات بمحتوياتها
            for folder in FOLDERS_TO_INCLUDE:
                if os.path.exists(folder):
                    for root, dirs, files in os.walk(folder):
                        for file in files:
                            file_path = os.path.join(root, file)
                            if not should_exclude(file_path):
                                archive_path = file_path
                                zipf.write(file_path, archive_path)
                    logger.info(f"✓ تمت إضافة المجلد: {folder}")
                else:
                    logger.warning(f"⚠️ المجلد غير موجود: {folder}")
            
            # إضافة ملف README بالإصلاحات
            readme_content = create_readme_content()
            zipf.writestr("README_FIXES.md", readme_content)
            logger.info(f"✓ تمت إضافة ملف README للإصلاحات")
            
        # طباعة معلومات عن الملف المنشأ
        file_size = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)  # بالميجابايت
        logger.info(f"\n✅ تم إنشاء ملف الحزمة بنجاح: {OUTPUT_ZIP}")
        logger.info(f"📦 حجم الملف: {file_size:.2f} ميجابايت")
        logger.info(f"📅 تاريخ الإنشاء: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return True
    except Exception as e:
        import traceback
        logger.error(f"حدث خطأ أثناء إنشاء حزمة النشر: {str(e)}")
        logger.error(traceback.format_exc())
        return False

def create_readme_content():
    """إنشاء محتوى ملف README للإصلاحات"""
    return """# دليل الإصلاحات

هذه الحزمة تتضمن إصلاحات مهمة للمشاكل التالية:

## 1. إصلاح مشكلة الفيديو

تم إصلاح مشكلة استمرار تشغيل الفيديو بعد إغلاق النافذة المنبثقة:

- إضافة ملف `enhanced-video-stop-manager.js` الذي يتضمن مدير متطور لإيقاف الفيديو
- تحسين ملف `simple-video-btn.js` للعمل مع المدير الجديد
- تحديث قالب `portfolio_modal.html` لاستخدام الإصلاحات الجديدة

الآلية الجديدة توفر طبقات متعددة من الحماية:
- إيقاف الفيديو عند النقر على زر الإغلاق
- إيقاف الفيديو عند النقر خارج النافذة المنبثقة
- إيقاف الفيديو عند الضغط على مفتاح ESC
- فحص دوري للتأكد من عدم استمرار تشغيل الفيديو

## 2. إصلاح مشكلة الوصول للوحة الإحصائيات

تم إصلاح مشكلة عدم القدرة على الوصول إلى لوحة الإحصائيات:

- إضافة ملف `fix_analytics_routes.py` الذي يعيد تعريف مسارات الإحصائيات
- تسجيل مسارات الإحصائيات المعدلة في ملف `main.py`
- إضافة ملف `fix_db_missing_columns.py` لإصلاح الأعمدة المفقودة في قاعدة البيانات

## 3. تعليمات التثبيت

1. قم بتحميل محتويات هذا الملف المضغوط إلى مستودع GitHub الخاص بك
2. قم بإعداد حساب على [Render](https://render.com/)
3. قم بإعداد قاعدة بيانات PostgreSQL (يمكن استخدام [Neon](https://neon.tech/))
4. اتبع التعليمات في ملف RENDER_DEPLOYMENT.md للإعداد الكامل

## 4. متغيرات البيئة المطلوبة

تأكد من إضافة المتغيرات البيئية التالية في إعدادات Render:

- `DATABASE_URL`: رابط الاتصال بقاعدة بيانات PostgreSQL
- `FLASK_SECRET_KEY`: مفتاح سري للتطبيق
- `SESSION_SECRET`: مفتاح سري للجلسات

للميزات الإضافية، أضف:
- `SENDGRID_API_KEY`: مفتاح API لخدمة SendGrid (للبريد الإلكتروني)
- `TELEGRAM_BOT_TOKEN`: توكن بوت تيليجرام (للإشعارات)
- `TELEGRAM_CHAT_ID`: معرف دردشة تيليجرام (للإشعارات)

## 5. التشخيص وحل المشاكل

إذا واجهت أي مشاكل بعد النشر، قم بزيارة:
- `/system-diagnostic` - لعرض معلومات تشخيصية
- `/test` - للتحقق من عمل التطبيق الأساسي
- `/api/status` - للتحقق من حالة التطبيق وإعداداته

تم تحديث في: {date}
""".format(date=datetime.datetime.now().strftime('%Y-%m-%d'))

if __name__ == "__main__":
    try:
        success = create_deployment_zip()
        if success:
            print(f"\n✅ تم إنشاء ملف {OUTPUT_ZIP} بنجاح!")
            sys.exit(0)
        else:
            print("\n❌ فشل في إنشاء حزمة النشر.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⚠️ تم إلغاء العملية.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ حدث خطأ غير متوقع: {str(e)}")
        sys.exit(1)