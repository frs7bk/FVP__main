"""
خدمة إرسال البريد الإلكتروني
تستخدم للإشعارات والرسائل المختلفة في الموقع
"""

import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType, Disposition
import base64
from email.mime.text import MIMEText

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_email(to_email, subject, html_content, from_email=None, attachments=None):
    """
    إرسال بريد إلكتروني باستخدام SendGrid
    
    Args:
        to_email: عنوان المستلم
        subject: عنوان الرسالة
        html_content: محتوى HTML
        from_email: عنوان المرسل (اختياري)
        attachments: قائمة بالمرفقات (اختياري)
    
    Returns:
        bool: نجاح العملية
    """
    if from_email is None:
        from_email = os.environ.get('DEFAULT_FROM_EMAIL', 'no-reply@example.com')
    
    # التحقق من وجود مفتاح API
    api_key = os.environ.get('SENDGRID_API_KEY')
    if not api_key:
        logger.warning("SENDGRID_API_KEY غير موجود في متغيرات البيئة")
        return False
    
    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )
    
    # إضافة المرفقات إذا كانت موجودة
    if attachments:
        for attachment_data in attachments:
            file_content = attachment_data.get('content')
            file_name = attachment_data.get('filename')
            file_type = attachment_data.get('type', 'application/octet-stream')
            
            if file_content and file_name:
                encoded_file = base64.b64encode(file_content).decode()
                attached_file = Attachment(
                    FileContent(encoded_file),
                    FileName(file_name),
                    FileType(file_type),
                    Disposition('attachment')
                )
                message.attachment = attached_file
    
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        
        if response.status_code >= 200 and response.status_code < 300:
            logger.info(f"تم إرسال البريد الإلكتروني بنجاح إلى {to_email}")
            return True
        else:
            logger.error(f"فشل إرسال البريد الإلكتروني: {response.status_code} - {response.body}")
            return False
            
    except Exception as e:
        logger.error(f"حدث خطأ أثناء إرسال البريد الإلكتروني: {str(e)}")
        return False


def send_contact_form_notification(name, email, message, phone=None):
    """
    إرسال إشعار بنموذج الاتصال
    
    Args:
        name: اسم المرسل
        email: بريد المرسل
        message: نص الرسالة
        phone: رقم الهاتف (اختياري)
    
    Returns:
        bool: نجاح العملية
    """
    # التحقق من وجود عنوان البريد الإلكتروني للمسؤول
    admin_email = os.environ.get('ADMIN_EMAIL')
    if not admin_email:
        # استخدام عنوان افتراضي من النظام
        admin_email = os.environ.get('DEFAULT_ADMIN_EMAIL', 'admin@example.com')
        logger.warning("ADMIN_EMAIL غير موجود في متغيرات البيئة، استخدام العنوان الافتراضي")
    
    # بناء محتوى HTML
    phone_info = f"<br><strong>رقم الهاتف:</strong> {phone}" if phone else ""
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; text-align: right;">
        <h2 style="color: #4a5568; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">رسالة جديدة من نموذج الاتصال</h2>
        <p><strong>الاسم:</strong> {name}</p>
        <p><strong>البريد الإلكتروني:</strong> {email}</p>
        {phone_info}
        <div style="margin-top: 20px; margin-bottom: 20px; padding: 15px; background-color: #f7fafc; border-radius: 5px; border-right: 4px solid #4299e1;">
            <h3 style="margin-top: 0; color: #2d3748;">الرسالة:</h3>
            <p style="white-space: pre-line;">{message}</p>
        </div>
        <p style="color: #718096; font-size: 0.9em; margin-top: 30px;">تم إرسال هذه الرسالة تلقائيًا من موقع البورتفوليو</p>
    </div>
    """
    
    # إرسال البريد الإلكتروني
    subject = f"رسالة جديدة من {name}"
    return send_email(admin_email, subject, html_content)


def send_verification_email(to_email, name, verification_url):
    """
    إرسال بريد تأكيد البريد الإلكتروني
    
    Args:
        to_email: عنوان البريد الإلكتروني للمستلم
        name: اسم المستلم
        verification_url: رابط التحقق
    
    Returns:
        bool: نجاح العملية
    """
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; text-align: right;">
        <h2 style="color: #4a5568; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">تأكيد البريد الإلكتروني</h2>
        <p>مرحباً {name}،</p>
        <p>شكراً للتسجيل في موقعنا. يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:</p>
        <p style="margin: 25px 0;">
            <a href="{verification_url}" style="display: inline-block; background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">تأكيد البريد الإلكتروني</a>
        </p>
        <p>أو يمكنك نسخ الرابط التالي ولصقه في متصفحك:</p>
        <p style="background-color: #f7fafc; padding: 10px; border-radius: 5px; word-break: break-all;">{verification_url}</p>
        <p>إذا لم تقم بإنشاء حساب، يرجى تجاهل هذا البريد الإلكتروني.</p>
        <p style="color: #718096; font-size: 0.9em; margin-top: 30px;">هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه.</p>
    </div>
    """
    
    subject = "تأكيد البريد الإلكتروني"
    return send_email(to_email, subject, html_content)


def send_password_reset_email(to_email, name, reset_url):
    """
    إرسال بريد إعادة تعيين كلمة المرور
    
    Args:
        to_email: عنوان البريد الإلكتروني للمستلم
        name: اسم المستلم
        reset_url: رابط إعادة التعيين
    
    Returns:
        bool: نجاح العملية
    """
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; text-align: right;">
        <h2 style="color: #4a5568; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">إعادة تعيين كلمة المرور</h2>
        <p>مرحباً {name}،</p>
        <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. انقر على الزر أدناه لإعادة تعيينها:</p>
        <p style="margin: 25px 0;">
            <a href="{reset_url}" style="display: inline-block; background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">إعادة تعيين كلمة المرور</a>
        </p>
        <p>أو يمكنك نسخ الرابط التالي ولصقه في متصفحك:</p>
        <p style="background-color: #f7fafc; padding: 10px; border-radius: 5px; word-break: break-all;">{reset_url}</p>
        <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
        <p>ينتهي هذا الرابط خلال 24 ساعة.</p>
        <p style="color: #718096; font-size: 0.9em; margin-top: 30px;">هذا البريد الإلكتروني تم إرساله تلقائياً، يرجى عدم الرد عليه.</p>
    </div>
    """
    
    subject = "إعادة تعيين كلمة المرور"
    return send_email(to_email, subject, html_content)


def send_new_comment_notification(portfolio_title, commenter_name, comment_text, admin_url):
    """
    إرسال إشعار بتعليق جديد إلى المسؤول
    
    Args:
        portfolio_title: عنوان المشروع
        commenter_name: اسم صاحب التعليق
        comment_text: نص التعليق
        admin_url: رابط لوحة تحكم المسؤول
    
    Returns:
        bool: نجاح العملية
    """
    # التحقق من وجود عنوان البريد الإلكتروني للمسؤول
    admin_email = os.environ.get('ADMIN_EMAIL')
    if not admin_email:
        # استخدام عنوان افتراضي من النظام
        admin_email = os.environ.get('DEFAULT_ADMIN_EMAIL', 'admin@example.com')
        logger.warning("ADMIN_EMAIL غير موجود في متغيرات البيئة، استخدام العنوان الافتراضي")
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; text-align: right;">
        <h2 style="color: #4a5568; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">تعليق جديد</h2>
        <p>هناك تعليق جديد تم إضافته إلى المشروع <strong>"{portfolio_title}"</strong>.</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f7fafc; border-radius: 5px; border-right: 4px solid #4299e1;">
            <p><strong>الاسم:</strong> {commenter_name}</p>
            <h3 style="margin-top: 10px; color: #2d3748;">التعليق:</h3>
            <p style="white-space: pre-line;">{comment_text}</p>
        </div>
        <p style="margin: 25px 0;">
            <a href="{admin_url}" style="display: inline-block; background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">مراجعة التعليق</a>
        </p>
        <p style="color: #718096; font-size: 0.9em; margin-top: 30px;">تم إرسال هذه الرسالة تلقائيًا من موقع البورتفوليو</p>
    </div>
    """
    
    subject = f"تعليق جديد على المشروع: {portfolio_title}"
    return send_email(admin_email, subject, html_content)


def fake_send_email(to_email, subject, html_content, from_email=None, attachments=None):
    """
    دالة بديلة لإرسال البريد الإلكتروني في حالة عدم توفر SendGrid API
    
    Args:
        to_email: عنوان المستلم
        subject: عنوان الرسالة
        html_content: محتوى HTML
        from_email: عنوان المرسل (اختياري)
        attachments: قائمة بالمرفقات (اختياري)
    
    Returns:
        bool: نجاح العملية
    """
    if from_email is None:
        from_email = os.environ.get('DEFAULT_FROM_EMAIL', 'no-reply@example.com')
    
    try:
        # تسجيل محاولة الإرسال
        logger.info(f"محاولة وهمية لإرسال بريد إلكتروني")
        logger.info(f"من: {from_email}")
        logger.info(f"إلى: {to_email}")
        logger.info(f"الموضوع: {subject}")
        logger.info(f"المحتوى: {html_content[:100]}... (مختصر)")
        
        if attachments:
            for attachment_data in attachments:
                file_name = attachment_data.get('filename')
                logger.info(f"مرفق: {file_name}")
        
        return True
    except Exception as e:
        logger.error(f"خطأ في تسجيل محاولة الإرسال الوهمية: {str(e)}")
        return False

# تحديد الدالة الافتراضية للإرسال
send_func = send_email

# التحقق من وجود مفتاح API عند استيراد الوحدة
if not os.environ.get('SENDGRID_API_KEY'):
    logger.warning("SENDGRID_API_KEY غير موجود في متغيرات البيئة، سيتم استخدام الإرسال الوهمي")
    # استبدال الدالة الحقيقية بالوهمية
    send_func = fake_send_email