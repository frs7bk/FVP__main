"""
نظام متابعة العملاء المحتملين تلقائياً
-----------------------------------

هذا النظام يقوم بأتمتة عملية متابعة العملاء المحتملين باستخدام تقنيات الذكاء الاصطناعي
والتكامل مع أنظمة CRM المختلفة.
"""

import os
import sys
import logging
import argparse
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# تكوين نظام التسجيل
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crm_automation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# إضافة مسار src إلى مسار Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config import settings
from src.database import init_db, get_db, Lead, Interaction, Task
from src.followup_manager import FollowUpManager, process_follow_ups
from src.email_service import EmailService
from src.ai_services import ai_service

class CRMAutomationSystem:
    """النظام الرئيسي لأتمتة إدارة علاقات العملاء"""
    
    def __init__(self):
        """تهيئة النظام"""
        self.setup_environment()
        self.setup_services()
        logger.info("تم تهيئة نظام أتمتة إدارة علاقات العملاء بنجاح")
    
    def setup_environment(self):
        """إعداد بيئة التشغيل"""
        # إنشاء مجلد السجلات إذا لم يكن موجوداً
        os.makedirs('logs', exist_ok=True)
        
        # إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجوداً
        os.makedirs('backups', exist_ok=True)
    
    def setup_services(self):
        """إعداد الخدمات المساعدة"""
        # تهيئة قاعدة البيانات
        init_db()
        
        # تهيئة خدمات البريد الإلكتروني
        self.email_service = EmailService()
        
        # تهيئة مدير المتابعة
        self.followup_manager = FollowUpManager(next(get_db()))
        
        logger.info("تم تهيئة جميع الخدمات بنجاح")
    
    def run_daily_tasks(self):
        """تشغيل المهام اليومية"""
        logger.info("بدء المهام اليومية")
        
        try:
            # 1. معالجة المتابعات اليومية
            followup_results = process_follow_ups()
            logger.info(f"تمت معالجة {followup_results.get('total_leads', 0)} عميل")
            
            # 2. إرسال التقارير اليومية
            self.send_daily_report(followup_results)
            
            # 3. إنشاء نسخة احتياطية
            self.create_backup()
            
            logger.info("اكتملت المهام اليومية بنجاح")
            return True
            
        except Exception as e:
            logger.error(f"فشل تنفيذ المهام اليومية: {str(e)}", exc_info=True)
            return False
    
    def send_daily_report(self, followup_results: Dict[str, Any]):
        """إرسال تقرير يومي عن النشاط"""
        try:
            # إعداد بيانات التقرير
            report_data = {
                'date': datetime.now().strftime('%Y-%m-%d'),
                'total_leads': followup_results.get('total_leads', 0),
                'emails_sent': followup_results.get('emails_sent', 0),
                'tasks_created': followup_results.get('tasks_created', 0),
                'errors': followup_results.get('errors', []),
                'system_status': 'جيد' if not followup_results.get('errors') else 'يحتاج مراجعة'
            }
            
            # إرسال التقرير بالبريد الإلكتروني
            subject = f"تقرير المتابعة اليومي - {report_data['date']}"
            
            # استخدام قالب HTML للتقرير
            html_content = f"""
            <html dir="rtl">
            <body>
                <h2>تقرير المتابعة اليومي</h2>
                <p>تاريخ التقرير: {date}</p>
                
                <h3>إحصائيات اليوم:</h3>
                <ul>
                    <li>إجمالي العملاء المعالجين: {total_leads}</li>
                    <li>عدد رسائل البريد الإلكتروني المرسلة: {emails_sent}</li>
                    <li>عدد المهام الجديدة: {tasks_created}</li>
                </ul>
                
                <h3>حالة النظام: {system_status}</h3>
                
                {errors_section if errors else ''}
                
                <p>مع أطيب التحيات،<br>فريق الدعم الفني</p>
            </body>
            </html>
            """.format(
                date=report_data['date'],
                total_leads=report_data['total_leads'],
                emails_sent=report_data['emails_sent'],
                tasks_created=report_data['tasks_created'],
                system_status=report_data['system_status'],
                errors_section=f"<h3>الأخطاء:</h3><ul>{''.join(f'<li>{error}</li>' for error in report_data['errors'])}</ul>" if report_data['errors'] else '',
                errors=report_data['errors']
            )
            
            # إرسال البريد الإلكتروني
            self.email_service.send_email(
                to_email=settings.ADMIN_EMAIL,
                subject=subject,
                html_content=html_content
            )
            
            logger.info("تم إرسال التقرير اليومي بنجاح")
            
        except Exception as e:
            logger.error(f"فشل إرسال التقرير اليومي: {str(e)}")
    
    def create_backup(self):
        """إنشاء نسخة احتياطية من قاعدة البيانات"""
        try:
            import shutil
            from datetime import datetime
            
            # اسم ملف النسخة الاحتياطية
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"backups/crm_backup_{timestamp}.db"
            
            # نسخ ملف قاعدة البيانات
            shutil.copy2('crm_database.db', backup_file)
            
            # الاحتفاظ بأحدث 7 نسخ احتياطية فقط
            self._cleanup_old_backups()
            
            logger.info(f"تم إنشاء نسخة احتياطية: {backup_file}")
            return True
            
        except Exception as e:
            logger.error(f"فشل إنشاء نسخة احتياطية: {str(e)}")
            return False
    
    def _cleanup_old_backups(self, keep_last: int = 7):
        """حذف النسخ الاحتياطية القديمة"""
        import glob
        import os
        
        try:
            # الحصول على قائمة بجميع ملفات النسخ الاحتياطية مرتبة حسب تاريخ التعديل
            backups = sorted(
                glob.glob('backups/crm_backup_*.db'),
                key=os.path.getmtime,
                reverse=True
            )
            
            # حذف الملفات الزائدة عن العدد المطلوب
            for backup in backups[keep_last:]:
                try:
                    os.remove(backup)
                    logger.info(f"تم حذف النسخة الاحتياطية القديمة: {backup}")
                except Exception as e:
                    logger.error(f"فشل حذف النسخة الاحتياطية {backup}: {str(e)}")
                    
        except Exception as e:
            logger.error(f"فشل تنظيف النسخ الاحتياطية القديمة: {str(e)}")

def parse_arguments():
    """تحليل وسائط سطر الأوامر"""
    parser = argparse.ArgumentParser(description='نظام أتمتة متابعة العملاء المحتملين')
    
    # وسائط سطر الأوامر
    parser.add_argument('--init-db', action='store_true', help='تهيئة قاعدة البيانات')
    parser.add_argument('--run-daily', action='store_true', help='تشغيل المهام اليومية')
    parser.add_argument('--process-followups', action='store_true', help='معالجة المتابعات فقط')
    parser.add_argument('--send-report', action='store_true', help='إرسال التقرير اليومي')
    parser.add_argument('--backup', action='store_true', help='إنشاء نسخة احتياطية')
    
    return parser.parse_args()

def main():
    """الدالة الرئيسية للتشغيل"""
    try:
        # تحليل وسائط سطر الأوامر
        args = parse_arguments()
        
        # إنشاء مثيل من النظام
        system = CRMAutomationSystem()
        
        # تنفيذ الأوامر المطلوبة
        if args.init_db:
            logger.info("تهيئة قاعدة البيانات...")
            init_db()
            logger.info("تمت تهيئة قاعدة البيانات بنجاح")
        
        if args.run_daily:
            logger.info("بدء المهام اليومية...")
            system.run_daily_tasks()
        
        if args.process_followups:
            logger.info("بدء معالجة المتابعات...")
            results = process_follow_ups()
            logger.info(f"تمت معالجة {results.get('total_leads', 0)} عميل")
        
        if args.send_report:
            logger.info("إرسال التقرير اليومي...")
            system.send_daily_report({})
        
        if args.backup:
            logger.info("إنشاء نسخة احتياطية...")
            system.create_backup()
        
        # إذا لم يتم تحديد أي أوامر، عرض رسالة المساعدة
        if not any(vars(args).values()):
            logger.info("لم يتم تحديد أي أوامر. استخدم --help لعرض المساعدة.")
    
    except KeyboardInterrupt:
        logger.info("تم إيقاف النظام بواسطة المستخدم")
        sys.exit(0)
    except Exception as e:
        logger.error(f"حدث خطأ غير متوقع: {str(e)}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
