import os
import datetime
import shutil
from datetime import datetime
import subprocess
from pathlib import Path

# إعدادات النسخ الاحتياطي
BACKUP_DIR = "backups"
DB_NAME = "your_database_name"
DB_USER = "your_db_user"
DB_PASS = "your_db_password"
KEEP_BACKUPS = 5  # عدد النسخ المحفوظة

def create_backup():
    try:
        # إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجوداً
        os.makedirs(BACKUP_DIR, exist_ok=True)
        
        # تاريخ ووقت النسخة الاحتياطية
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"backup_{timestamp}"
        
        # 1. نسخ قاعدة البيانات
        db_backup_path = os.path.join(BACKUP_DIR, f"{backup_name}.sql")
        cmd = f'pg_dump -U {DB_USER} -d {DB_NAME} -f {db_backup_path}'
        subprocess.run(cmd, shell=True, env={**os.environ, 'PGPASSWORD': DB_PASS})
        
        # 2. نسخ الملفات المهمة
        files_backup_path = os.path.join(BACKUP_DIR, f"{backup_name}_files")
        os.makedirs(files_backup_path, exist_ok=True)
        
        # نسخ المجلدات المهمة
        important_dirs = ['static/uploads', 'templates']
        for dir_name in important_dirs:
            if os.path.exists(dir_name):
                shutil.copytree(dir_name, os.path.join(files_backup_path, dir_name))
        
        # 3. ضغط الملفات
        shutil.make_archive(backup_name, 'zip', files_backup_path)
        shutil.move(f"{backup_name}.zip", os.path.join(BACKUP_DIR, f"{backup_name}.zip"))
        
        # 4. تنظيف الملفات المؤقتة
        shutil.rmtree(files_backup_path)
        
        # 5. حذف النسخ القديمة
        backups = sorted(Path(BACKUP_DIR).glob("backup_*.zip"), key=os.path.getmtime)
        while len(backups) > KEEP_BACKUPS:
            os.remove(backups.pop(0))
            
        print(f"تم إنشاء نسخة احتياطية بنجاح: {backup_name}.zip")
        
    except Exception as e:
        print(f"حدث خطأ أثناء إنشاء النسخة الاحتياطية: {str(e)}")

if __name__ == "__main__":
    create_backup()
