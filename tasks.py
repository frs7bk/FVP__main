from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import atexit
import logging
from monitoring import MonitoringSystem

class TaskScheduler:
    def __init__(self, app=None):
        self.scheduler = BackgroundScheduler()
        self.app = app
        self.monitoring = None
        
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        self.app = app
        self.monitoring = MonitoringSystem(app)
        
        # جدولة المهام
        self.schedule_tasks()
        
        # بدء المخطط
        self.scheduler.start()
        
        # إيقاف المخطط عند إيقاف التطبيق
        atexit.register(lambda: self.scheduler.shutdown())
    
    def schedule_tasks(self):
        """جدولة المهام التلقائية"""
        # نسخ احتياطي يومي في منتصف الليل
        self.scheduler.add_job(
            id='daily_backup',
            func=self.run_daily_backup,
            trigger=CronTrigger(hour=0, minute=0),
            replace_existing=True
        )
        
        # تنظيف الملفات المؤقتة يومياً الساعة 3 صباحاً
        self.scheduler.add_job(
            id='clean_temp_files',
            func=self.clean_temp_files,
            trigger=CronTrigger(hour=3, minute=0),
            replace_existing=True
        )
        
        # إرسال تقرير أسبوعي يوم الأحد الساعة 9 صباحاً
        self.scheduler.add_job(
            id='weekly_report',
            func=self.send_weekly_report,
            trigger=CronTrigger(day_of_week='sun', hour=9, minute=0),
            replace_existing=True
        )
    
    def run_daily_backup(self):
        """تشغيل نسخ احتياطي يومي"""
        try:
            # استدعاء سكريبت النسخ الاحتياطي
            from backup_script import create_backup
            create_backup()
            self.monitoring.send_telegram_alert("✅ تم إنشاء نسخة احتياطية يومية بنجاح")
        except Exception as e:
            self.monitoring.send_telegram_alert(f"❌ فشل إنشاء نسخة احتياطية: {str(e)}")
    
    def clean_temp_files(self):
        """تنظيف الملفات المؤقتة"""
        import os
        import glob
        import time
        
        now = time.time()
        temp_dirs = ['/tmp', 'uploads/temp']
        
        for temp_dir in temp_dirs:
            if not os.path.exists(temp_dir):
                continue
                
            for filename in glob.glob(f"{temp_dir}/*"):
                try:
                    # حذف الملفات الأقدم من 7 أيام
                    if os.path.isfile(filename):
                        file_time = os.path.getmtime(filename)
                        if (now - file_time) > (7 * 24 * 60 * 60):  # 7 أيام
                            os.remove(filename)
                except Exception as e:
                    self.monitoring.send_telegram_alert(f"خطأ في تنظيف الملفات المؤقتة: {str(e)}")
    
    def send_weekly_report(self):
        """إرسال تقرير أسبوعي"""
        from app import db
        from models import User, PortfolioItem, ContactMessage
        
        try:
            # إحصائيات المستخدمين الجدد
            new_users = User.query.filter(
                User.registration_date >= db.func.date_sub(db.func.now(), db.text('interval 7 day'))
            ).count()
            
            # إحصائيات المشاريع الجديدة
            new_projects = PortfolioItem.query.filter(
                PortfolioItem.created_at >= db.func.date_sub(db.func.now(), db.text('interval 7 day'))
            ).count()
            
            # رسائل الاتصال الجديدة
            new_messages = ContactMessage.query.filter(
                ContactMessage.created_at >= db.func.date_sub(db.func.now(), db.text('interval 7 day'))
            ).count()
            
            # إنشاء التقرير
            report = f"""
            📊 التقرير الأسبوعي
            ===============
            
            👥 المستخدمون الجدد: {new_users}
            🖼️ المشاريع المضافة: {new_projects}
            📩 رسائل الاتصال: {new_messages}
            
            التاريخ: {datetime.now().strftime('%Y-%m-%d %H:%M')}
            """
            
            self.monitoring.send_telegram_alert(report)
            
        except Exception as e:
            self.monitoring.send_telegram_alert(f"❌ فشل إرسال التقرير الأسبوعي: {str(e)}")

# لاستخدام النظام في التطبيق:
# scheduler = TaskScheduler(app)
