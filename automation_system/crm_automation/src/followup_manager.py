"""
مدير المتابعة الآلية للعملاء المحتملين
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from .database import Lead, Interaction, get_db
from .email_service import EmailService
from .ai_services import ai_service
from .config import settings

# إعداد التسجيل
logger = logging.getLogger(__name__)

class FollowUpManager:
    """فئة إدارة متابعة العملاء المحتملين"""
    
    def __init__(self, db_session: Session):
        """تهيئة مدير المتابعة"""
        self.db = db_session
        self.email_service = EmailService()
    
    def get_leads_for_followup(self) -> List[Lead]:
        """استرجاع العملاء المحتاجين للمتابعة"""
        try:
            # حساب تاريخ اليوم
            today = datetime.utcnow()
            
            # استعلام للعثور على العملاء المحتاجين للمتابعة
            leads = self.db.query(Lead).filter(
                and_(
                    Lead.status.in_(["new", "contacted", "qualified"]),
                    or_(
                        Lead.next_follow_up <= today,
                        Lead.next_follow_up.is_(None)
                    ),
                    Lead.follow_up_count < settings.MAX_FOLLOW_UPS
                )
            ).all()
            
            logger.info(f"تم العثور على {len(leads)} عميل يحتاجون متابعة")
            return leads
            
        except Exception as e:
            logger.error(f"فشل استرجاع العملاء للمتابعة: {str(e)}")
            return []
    
    def process_follow_ups(self) -> Dict[str, Any]:
        """معالجة جميع المتابعات المطلوبة"""
        results = {
            "total_leads": 0,
            "emails_sent": 0,
            "tasks_created": 0,
            "errors": []
        }
        
        try:
            # الحصول على العملاء المحتاجين للمتابعة
            leads = self.get_leads_for_followup()
            results["total_leads"] = len(leads)
            
            for lead in leads:
                try:
                    # الحصول على سجل التفاعلات السابقة
                    interactions = self.db.query(Interaction).filter(
                        Interaction.lead_id == lead.id
                    ).order_by(Interaction.created_at.desc()).all()
                    
                    # تحليل المشاعر من التفاعلات السابقة
                    self._analyze_interactions(interactions)
                    
                    # إنشاء مهمة متابعة
                    task_created = self._create_followup_task(lead, interactions)
                    if task_created:
                        results["tasks_created"] += 1
                    
                    # إرسال بريد المتابعة إذا لزم الأمر
                    if self._should_send_email(lead, interactions):
                        email_sent = self._send_followup_email(lead, interactions)
                        if email_sent:
                            results["emails_sent"] += 1
                    
                    # تحديث سجل المتابعة
                    self._update_lead_followup(lead)
                    
                except Exception as e:
                    error_msg = f"خطأ في معالجة العميل {lead.id}: {str(e)}"
                    logger.error(error_msg)
                    results["errors"].append(error_msg)
            
            # حفظ التغييرات في قاعدة البيانات
            self.db.commit()
            
        except Exception as e:
            error_msg = f"فشل معالجة المتابعات: {str(e)}"
            logger.error(error_msg)
            results["errors"].append(error_msg)
            self.db.rollback()
        
        return results
    
    def _analyze_interactions(self, interactions: List[Interaction]) -> None:
        """تحليل تفاعلات العميل"""
        if not settings.ENABLE_SENTIMENT_ANALYSIS:
            return
        
        for interaction in interactions:
            if not interaction.sentiment_score and interaction.content:
                try:
                    # تحليل المشاعر إذا لم يتم تحليلها مسبقاً
                    analysis = ai_service.analyze_sentiment(interaction.content)
                    if analysis["label"] != "error":
                        interaction.sentiment_score = analysis["score"]
                        interaction.sentiment_label = analysis["label"]
                except Exception as e:
                    logger.error(f"فشل تحليل مشاعر التفاعل {interaction.id}: {str(e)}")
    
    def _create_followup_task(self, lead: Lead, interactions: List[Interaction]) -> bool:
        """إنشاء مهمة متابعة للعميل"""
        try:
            # الحصول على اقتراح المتابعة من الذكاء الاصطناعي
            lead_info = {
                "first_name": lead.first_name,
                "last_name": lead.last_name,
                "company": lead.company,
                "email": lead.email,
                "phone": lead.phone
            }
            
            interactions_data = [{
                "content": i.content,
                "interaction_type": i.interaction_type,
                "created_at": i.created_at.isoformat(),
                "sentiment_score": i.sentiment_score
            } for i in interactions]
            
            suggestion = ai_service.generate_followup_suggestion(lead_info, interactions_data)
            
            # إنشاء مهمة جديدة
            from .database import Task
            task = Task(
                lead_id=lead.id,
                title=f"متابعة مع {lead.first_name} {lead.last_name}",
                description=suggestion["suggestion"],
                due_date=datetime.utcnow() + timedelta(days=1),  # متابعة بعد يوم
                priority=suggestion["priority"],
                assigned_to="sales_team"  # يمكن تخصيصه حسب احتياجاتك
            )
            
            self.db.add(task)
            logger.info(f"تم إنشاء مهمة متابعة للعميل {lead.id}")
            return True
            
        except Exception as e:
            logger.error(f"فشل إنشاء مهمة متابعة للعميل {lead.id}: {str(e)}")
            return False
    
    def _should_send_email(self, lead: Lead, interactions: List[Interaction]) -> bool:
        """تحديد ما إذا كان يجب إرسال بريد متابعة"""
        if not lead.email:
            return False
            
        # عدم إرسال بريد إذا كان آخر تفاعل منذ أقل من يوم
        last_interaction = interactions[0] if interactions else None
        if last_interaction and (datetime.utcnow() - last_interaction.created_at).days < 1:
            return False
            
        # إضافة المزيد من الشروط حسب الحاجة
        return True
    
    def _send_followup_email(self, lead: Lead, interactions: List[Interaction]) -> bool:
        """إرسال بريد متابعة للعميل"""
        try:
            # إنشاء محتوى البريد الإلكتروني
            subject = f"متابعة: {lead.company or 'عزيزي العميل'}"
            
            # استخدام قالب HTML احترافي
            template = """
            <html>
            <body>
                <p>مرحباً {first_name}،</p>
                <p>نأمل أن تكون بخير.</p>
                <p>نحن نقدر اهتمامك بـ {company} ونريد أن نتحقق مما إذا كان لديك أي أسئلة إضافية.</p>
                <p>لا تتردد في الرد على هذا البريد أو الاتصال بنا مباشرة على {phone}.</p>
                <p>مع أطيب التحيات،<br>فريق خدمة العملاء</p>
            </body>
            </html>
            """
            
            # ملء القالب بالبيانات
            email_content = template.format(
                first_name=lead.first_name,
                company=lead.company or "خدماتنا",
                phone=lead.phone or settings.CONTACT_PHONE
            )
            
            # إرسال البريد الإلكتروني
            self.email_service.send_email(
                to_email=lead.email,
                subject=subject,
                html_content=email_content
            )
            
            # تسجيل التفاعل
            interaction = Interaction(
                lead_id=lead.id,
                interaction_type="email",
                direction="outbound",
                subject=subject,
                content=email_content
            )
            
            self.db.add(interaction)
            logger.info(f"تم إرسال بريد متابعة إلى {lead.email}")
            return True
            
        except Exception as e:
            logger.error(f"فشل إرسال بريد المتابعة إلى {lead.email}: {str(e)}")
            return False
    
    def _update_lead_followup(self, lead: Lead) -> None:
        """تحديث سجل متابعة العميل"""
        try:
            lead.follow_up_count += 1
            
            # حساب موعد المتابعة التالية
            follow_up_days = settings.FOLLOW_UP_DAYS
            next_follow_up_index = min(lead.follow_up_count - 1, len(follow_up_days) - 1)
            next_follow_up_days = follow_up_days[next_follow_up_index]
            
            lead.next_follow_up = datetime.utcnow() + timedelta(days=next_follow_up_days)
            lead.updated_at = datetime.utcnow()
            
            # تحديث حالة العميل إذا لزم الأمر
            if lead.status == "new":
                lead.status = "contacted"
            
            self.db.add(lead)
            
        except Exception as e:
            logger.error(f"فشل تحديث سجل متابعة العميل {lead.id}: {str(e)}")
            raise

# دالة مساعدة للاستخدام مع سياق قاعدة البيانات
def process_follow_ups() -> Dict[str, Any]:
    """معالجة جميع المتابعات المطلوبة (واجهة سهلة الاستخدام)"""
    with get_db() as db:
        manager = FollowUpManager(db)
        return manager.process_follow_ups()

# تصدير الدوال والوحدات
__all__ = ["FollowUpManager", "process_follow_ups"]
