#!/usr/bin/env python3
"""
إنشاء حزمة بسيطة وشاملة للنشر على Render
يتضمن جميع الملفات الضرورية فقط في ملف ZIP واحد
"""
import os
import zipfile
import logging

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger()

# اسم ملف ZIP الناتج
OUTPUT_ZIP = "portfolio_render_simple.zip"

# قائمة المجلدات التي يجب تضمينها
INCLUDE_FOLDERS = [
    "static",
    "templates",
    "instance"
]

# قائمة الملفات الأساسية
ESSENTIAL_FILES = [
    "app.py",
    "main.py",
    "models.py",
    "database.py",
    "render.yaml",
    "render-requirements.txt",
    "render_setup.py",
    "test_database_connection.py",
    "fix_admin_access.py",
    "fix_analytics_routes.py",
    "fix_db_missing_columns.py"
]

# الملفات التي يجب استبعادها
EXCLUDE_PATTERNS = [
    "__pycache__",
    ".git",
    ".venv",
    ".env",
    ".pyc",
    ".pyo",
    ".DS_Store",
    ".pytest_cache",
    "node_modules"
]

def should_exclude(path):
    """التحقق مما إذا كان ينبغي استبعاد المسار"""
    for pattern in EXCLUDE_PATTERNS:
        if pattern in path:
            return True
    return False

def create_simple_package():
    """إنشاء حزمة بسيطة وشاملة"""
    logger.info("جاري إنشاء حزمة بسيطة للنشر على Render...")
    
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # إضافة الملفات الأساسية
        for file in ESSENTIAL_FILES:
            if os.path.exists(file):
                zipf.write(file)
                logger.info(f"✓ {file}")
        
        # إضافة المجلدات
        for folder in INCLUDE_FOLDERS:
            if os.path.exists(folder):
                for root, dirs, files in os.walk(folder):
                    # استبعاد المجلدات غير المرغوبة
                    dirs[:] = [d for d in dirs if not should_exclude(os.path.join(root, d))]
                    
                    for file in files:
                        file_path = os.path.join(root, file)
                        if not should_exclude(file_path):
                            zipf.write(file_path)
                logger.info(f"✓ {folder}/")
    
    file_size = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)  # حجم الملف بالميجابايت
    logger.info(f"\n✅ تم إنشاء الحزمة البسيطة بنجاح: {OUTPUT_ZIP}")
    logger.info(f"📦 حجم الملف: {file_size:.2f} ميجابايت")
    logger.info("\nخطوات النشر على Render:")
    logger.info("1. فك ضغط الملف")
    logger.info("2. رفع الملفات على GitHub")
    logger.info("3. إنشاء خدمة جديدة في Render وربطها بمستودع GitHub")
    logger.info("4. إضافة متغيرات البيئة: DATABASE_URL, FLASK_SECRET_KEY, SESSION_SECRET")

if __name__ == "__main__":
    create_simple_package()