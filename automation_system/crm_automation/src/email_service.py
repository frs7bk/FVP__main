"""
وحدة خدمة البريد الإلكتروني
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from typing import List, Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader
import os
from pathlib import Path

from .config import settings

# إعداد التسجيل
logger = logging.getLogger(__name__)


class EmailService:
    """فئة خدمة البريد الإلكتروني"""
    
    def __init__(self):
        """تهيئة خدمة البريد الإلكتروني"""
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.default_from = settings.EMAIL_FROM
        
        # تحميل قوالب البريد الإلكتروني
        self.templates_dir = Path(__file__).parent / "templates"
        self.jinja_env = Environment(
            loader=FileSystemLoader(self.templates_dir),
            autoescape=True
        )
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str = None,
        text_content: str = None,
        from_email: str = None,
        cc: List[str] = None,
        bcc: List[str] = None,
        attachments: List[Dict[str, Any]] = None,
        template_name: str = None,
        template_vars: Dict[str, Any] = None
    ) -> bool:
        """
        إرسال بريد إلكتروني
        
        Args:
            to_email: عنوان البريد الإلكتروني للمستلم
            subject: موضوع البريد الإلكتروني
            html_content: محتوى HTML (اختياري)
            text_content: محتوى نصي عادي (اختياري)
            from_email: عنوان المرسل (اختياري، يستخدم الإعداد الافتراضي إذا لم يتم التحديد)
            cc: قائمة عناوين البريد الإلكتروني للنسخة الكربونية
            bcc: قائمة عناوين البريد الإلكتروني للنسخة الكربونية المخفية
            attachments: قائمة المرفقات
            template_name: اسم ملف القالب (اختياري)
            template_vars: متغيرات القالب (اختياري)
            
        Returns:
            bool: True إذا تم إرسال البريد بنجاح، False خلاف ذلك
        """
        try:
            # إنشاء رسالة البريد الإلكتروني
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = from_email or self.default_from
            msg['To'] = to_email
            
            if cc:
                msg['Cc'] = ', '.join(cc)
            
            # إعداد المحتوى النصي والرسومي
            if template_name:
                # استخدام قالب جينجا إذا تم تحديده
                template = self.jinja_env.get_template(template_name)
                html_content = template.render(**(template_vars or {}))
            
            # إضافة المحتوى النصي إذا كان متوفراً
            if text_content:
                part1 = MIMEText(text_content, 'plain', 'utf-8')
                msg.attach(part1)
            
            # إضافة المحتوى HTML إذا كان متوفراً
            if html_content:
                part2 = MIMEText(html_content, 'html', 'utf-8')
                msg.attach(part2)
            
            # إضافة المرفقات إذا وجدت
            if attachments:
                self._attach_files(msg, attachments)
            
            # إرسال البريد الإلكتروني
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                
                # إرسال البريد إلى جميع المستلمين
                recipients = [to_email]
                if cc:
                    recipients.extend(cc)
                if bcc:
                    recipients.extend(bcc)
                
                server.send_message(msg)
                logger.info(f"تم إرسال البريد الإلكتروني بنجاح إلى {to_email}")
                return True
                
        except Exception as e:
            logger.error(f"فشل إرسال البريد الإلكتروني إلى {to_email}: {str(e)}")
            return False
    
    def _attach_files(self, msg: MIMEMultipart, attachments: List[Dict[str, Any]]) -> None:
        """إضافة مرفقات إلى رسالة البريد"""
        from email.mime.base import MIMEBase
        from email import encoders
        import mimetypes
        
        for attachment in attachments:
            try:
                file_path = attachment.get('file_path')
                file_name = attachment.get('file_name', os.path.basename(file_path))
                content_type = attachment.get('content_type')
                
                if not content_type:
                    content_type, encoding = mimetypes.guess_type(file_path)
                    if content_type is None or encoding is not None:
                        content_type = 'application/octet-stream'
                
                maintype, subtype = content_type.split('/', 1)
                
                with open(file_path, 'rb') as f:
                    part = MIMEBase(maintype, subtype)
                    part.set_payload(f.read())
                    
                encoders.encode_base64(part)
                part.add_header('Content-Disposition', 'attachment', filename=file_name)
                msg.attach(part)
                
            except Exception as e:
                logger.error(f"فشل إضافة المرفق {file_path}: {str(e)}")
    
    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """إرسال بريد ترحيبي"""
        subject = "مرحباً بك في نظامنا"
        template_vars = {
            'user_name': user_name,
            'welcome_message': 'نشكرك على انضمامك إلينا!',
            'contact_email': 'support@example.com',
            'contact_phone': '+966 12 345 6789'
        }
        
        return self.send_email(
            to_email=to_email,
            subject=subject,
            template_name='welcome_email.html',
            template_vars=template_vars
        )
    
    def send_password_reset(self, to_email: str, reset_link: str) -> bool:
        """إرسال رابط إعادة تعيين كلمة المرور"""
        subject = "إعادة تعيين كلمة المرور"
        template_vars = {
            'reset_link': reset_link,
            'expiration_hours': 24
        }
        
        return self.send_email(
            to_email=to_email,
            subject=subject,
            template_name='password_reset.html',
            template_vars=template_vars
        )

# إنشاء نسخة من الخدمة
email_service = EmailService()

# تصدير الخدمة
__all__ = ["EmailService", "email_service"]
