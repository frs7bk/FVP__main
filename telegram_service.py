"""
خدمة إرسال الإشعارات عبر تيليجرام
تستخدم لإرسال الإشعارات المختلفة في الموقع عبر بوت تيليجرام
"""

import os
import logging
import json
import requests
import sys
import traceback
from datetime import datetime

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_telegram_message(message, parse_mode='HTML'):
    """
    إرسال رسالة عبر تيليجرام
    
    Args:
        message: نص الرسالة
        parse_mode: وضع التنسيق ('HTML' أو 'Markdown')
    
    Returns:
        bool: نجاح العملية
    """
    # التحقق من وجود الرموز المطلوبة
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    
    # سجل حالة وجود الرموز
    logger.info(f"Bot token exists: {bool(bot_token)}, Chat ID exists: {bool(chat_id)}")
    
    if not bot_token or not chat_id:
        logger.warning("Telegram configuration missing: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not found in environment variables.")
        return False
    
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": parse_mode
        }
        
        response = requests.post(url, data=data, timeout=10)
        
        if response.status_code == 200:
            logger.info(f"Telegram notification sent successfully")
            return True
        else:
            logger.error(f"Failed to send Telegram notification: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        trace = traceback.format_exc()
        logger.error(f"Error sending Telegram notification: {str(e)}")
        logger.error(f"Trace: {trace}")
        return False


def test_telegram_notification():
    """
    اختبار الاتصال بتيليجرام وإرسال رسالة تجريبية
    
    Returns:
        bool: نجاح العملية
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    test_message = f"""
<b>اختبار اتصال تيليجرام</b>

تم الاتصال بنجاح بـ Telegram API!
هذه رسالة تجريبية للتأكد من صحة الاتصال.

<code>الوقت: {timestamp}</code>
<code>النظام: {sys.platform}</code>
"""
    result = send_telegram_message(test_message)
    return result


def format_contact_message(name, email, message, phone=None):
    """
    تنسيق رسالة نموذج الاتصال لإرسالها عبر تيليجرام
    
    Args:
        name: اسم المرسل
        email: بريد المرسل
        message: نص الرسالة
        phone: رقم الهاتف (اختياري)
    
    Returns:
        str: النص المنسق
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    phone_info = f"\n📱 <b>الهاتف:</b> {phone}" if phone else ""
    
    formatted_message = f"""
🔔 <b>رسالة جديدة من نموذج الاتصال</b>

👤 <b>الاسم:</b> {name}
📧 <b>البريد:</b> {email}{phone_info}

📝 <b>الرسالة:</b>
<pre>{message}</pre>

⏰ <code>{timestamp}</code>
"""
    return formatted_message


def format_testimonial(name, testimonial):
    """
    تنسيق إشعار شهادة/تقييم جديد لإرسالها عبر تيليجرام
    
    Args:
        name: اسم صاحب الشهادة
        testimonial: نص الشهادة
    
    Returns:
        str: النص المنسق
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    formatted_message = f"""
🌟 <b>شهادة/تقييم جديد</b>

👤 <b>من:</b> {name}

💬 <b>المحتوى:</b>
<pre>{testimonial}</pre>

⏰ <code>{timestamp}</code>
"""
    return formatted_message


def format_portfolio_comment(name, portfolio_title, comment):
    """
    تنسيق إشعار تعليق جديد على مشروع لإرساله عبر تيليجرام
    
    Args:
        name: اسم المعلق
        portfolio_title: عنوان المشروع
        comment: نص التعليق
    
    Returns:
        str: النص المنسق
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    formatted_message = f"""
💬 <b>تعليق جديد على مشروع</b>

🖼 <b>المشروع:</b> {portfolio_title}
👤 <b>من:</b> {name}

📝 <b>التعليق:</b>
<pre>{comment}</pre>

⏰ <code>{timestamp}</code>
"""
    return formatted_message
    
def format_like_notification(name, portfolio_title):
    """
    تنسيق إشعار إعجاب جديد بمشروع لإرساله عبر تيليجرام
    
    Args:
        name: اسم المعجب
        portfolio_title: عنوان المشروع
    
    Returns:
        str: النص المنسق
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    formatted_message = f"""
❤️ <b>إعجاب جديد بمشروع</b>

🖼 <b>المشروع:</b> {portfolio_title}
👤 <b>من:</b> {name}

⏰ <code>{timestamp}</code>
"""
    return formatted_message


def format_order_notification(name, service, details):
    """
    تنسيق إشعار طلب خدمة جديد لإرساله عبر تيليجرام
    
    Args:
        name: اسم العميل
        service: نوع الخدمة
        details: تفاصيل الطلب
    
    Returns:
        str: النص المنسق
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    formatted_message = f"""
🛎 <b>طلب خدمة جديد</b>

👤 <b>العميل:</b> {name}
🔧 <b>الخدمة:</b> {service}

📋 <b>التفاصيل:</b>
<pre>{details}</pre>

⏰ <code>{timestamp}</code>
"""
    return formatted_message


def send_new_user_notification(username, email):
    """
    إرسال إشعار بتسجيل مستخدم جديد
    
    Args:
        username: اسم المستخدم
        email: البريد الإلكتروني
    
    Returns:
        bool: نجاح العملية
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    formatted_message = f"""
👤 <b>تسجيل مستخدم جديد</b>

🔹 <b>اسم المستخدم:</b> {username}
📧 <b>البريد الإلكتروني:</b> {email}

⏰ <code>{timestamp}</code>
"""
    return send_telegram_message(formatted_message)


def format_visit_notification(visitor_id, ip, user_agent=None):
    """
    تنسيق إشعار زيارة جديدة لإرساله عبر تيليجرام
    
    Args:
        visitor_id: معرف الزائر
        ip: عنوان IP
        user_agent: معلومات متصفح الزائر (اختياري)
    
    Returns:
        str: النص المنسق
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    ua_info = f"\n🌐 <b>المتصفح:</b> {user_agent[:100]}..." if user_agent else ""
    
    formatted_message = f"""
🔎 <b>زائر جديد للموقع</b>

🆔 <b>معرف الزائر:</b> {visitor_id}
🌐 <b>عنوان IP:</b> {ip}{ua_info}

⏰ <code>{timestamp}</code>
"""
    return formatted_message

def send_new_visitor_notification(visitor_id, ip, user_agent=None):
    """
    إرسال إشعار بزائر جديد
    
    Args:
        visitor_id: معرف الزائر
        ip: عنوان IP
        user_agent: معلومات متصفح الزائر (اختياري)
    
    Returns:
        bool: نجاح العملية
    """
    # إشعار بزائر جديد - سجل فقط ولا ترسل
    logger.info(f"Sent Telegram notification for new visitor: {visitor_id} from IP: {ip}")
    
    # تنسيق الرسالة
    message = format_visit_notification(visitor_id, ip, user_agent)
    
    # اختياري - يمكن تعطيله لتقليل عدد الإشعارات
    # return send_telegram_message(message)
    return True


def format_error_notification(error_message, route, method, form_data=None, user_id=None):
    """
    تنسيق إشعار خطأ في النظام لإرساله عبر تيليجرام
    
    Args:
        error_message: رسالة الخطأ
        route: المسار الذي حدث فيه الخطأ
        method: طريقة الطلب
        form_data: بيانات النموذج (اختياري)
        user_id: معرف المستخدم (اختياري)
    
    Returns:
        str: النص المنسق
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # تنسيق بيانات النموذج بشكل آمن
    safe_form_data = None
    if form_data:
        try:
            safe_form = {k: '***' if 'password' in k.lower() else v for k, v in form_data.items()}
            safe_form_data = json.dumps(safe_form, ensure_ascii=False, indent=2)
        except:
            safe_form_data = "Unable to format form data"
    
    user_info = f"\n👤 <b>المستخدم:</b> {user_id}" if user_id else ""
    form_info = f"\n📋 <b>بيانات النموذج:</b>\n<pre>{safe_form_data}</pre>" if safe_form_data else ""
    
    formatted_message = f"""
⚠️ <b>حدث خطأ في النظام</b>

🔴 <b>الخطأ:</b>
<pre>{error_message[:500]}</pre>

🌐 <b>المسار:</b> <code>{route}</code>
🔄 <b>الطريقة:</b> <code>{method}</code>{user_info}{form_info}

⏰ <code>{timestamp}</code>
"""
    return formatted_message


def send_error_notification(error_message, route, method, form_data=None, user_id=None):
    """
    إرسال إشعار بخطأ في النظام
    
    Args:
        error_message: رسالة الخطأ
        route: المسار الذي حدث فيه الخطأ
        method: طريقة الطلب
        form_data: بيانات النموذج (اختياري)
        user_id: معرف المستخدم (اختياري)
    
    Returns:
        bool: نجاح العملية
    """
    formatted_message = format_error_notification(error_message, route, method, form_data, user_id)
    return send_telegram_message(formatted_message)