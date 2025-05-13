
from app import app
import logging
import os
import sys
import traceback
from flask import jsonify, request
from fix_modals_register import register_fix_modals
from fix_portfolio_modal_routes import init_portfolio_modal_fix
from telegram_test_routes import init_telegram_test_routes
from direct_telegram_test import init_direct_telegram
from fix_analytics_routes import init_views_analytics
from fix_visitor_notification import fix_visitor_notification

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# تسجيل مسارات إصلاح النوافذ المنبثقة
app = register_fix_modals(app)
logger.info("تم تسجيل مسارات إصلاح النوافذ المنبثقة")

# تسجيل مسارات النافذة المنبثقة بنمط إنستغرام
app = init_portfolio_modal_fix(app)
logger.info("تم تسجيل مسارات النافذة المنبثقة بنمط إنستغرام")

# تسجيل مسارات اختبار تيليجرام
init_telegram_test_routes(app)
logger.info("تم تسجيل مسارات اختبار تيليجرام")

# تسجيل مسارات اختبار تلغرام المباشر
init_direct_telegram(app)
logger.info("تم تسجيل مسارات اختبار تلغرام المباشر")

# تسجيل مسارات تحليلات المشاهدات المعدلة
app = init_views_analytics(app)
logger.info("تم تسجيل مسارات تحليلات المشاهدات المعدلة")

# تكوين معالج خطأ عام للحصول على تفاصيل الأخطاء
@app.errorhandler(500)
def internal_server_error(e):
    tb = traceback.format_exc()
    logger.error(f"خطأ 500: {str(e)}\n{tb}")
    
    # سجل معلومات الطلب
    logger.error(f"Request path: {request.path}")
    logger.error(f"Request method: {request.method}")
    
    # سجل معلومات النموذج
    if request.form:
        logger.error(f"Request form keys: {', '.join(request.form.keys())}")
    else:
        logger.error("Request form keys: No form data")
    
    # سجل معلومات الملفات
    if request.files:
        logger.error(f"Request files keys: {', '.join(request.files.keys())}")
    else:
        logger.error("Request files keys: No files")
    
    # سجل المحيل
    logger.error(f"Referrer: {request.referrer}")
    logger.error("=== END DEBUG INFO ===")
    
    return "حدث خطأ في الخادم. تم تسجيل التفاصيل للمراجعة.", 500

# مسار اختباري بسيط للتحقق من الاتصال الأساسي
@app.route('/test')
def test_route():
    return "التطبيق يعمل بشكل صحيح!", 200

# مسار اختباري مباشر لصفحة تفاصيل الخدمة
@app.route('/test-service')
def test_service_route():
    try:
        from models import Service
        
        # تجنب الأخطاء بتمرير المتغيرات المطلوبة فقط دون تعقيد
        services = Service.query.all()
        if not services:
            return "لا توجد خدمات متاحة حالياً", 200
            
        service = services[0]
        return f"""
        <html>
        <head><title>اختبار الخدمة</title></head>
        <body dir="rtl">
            <h1>خدمة: {service.title}</h1>
            <p>{service.subtitle}</p>
            <a href="/">العودة للرئيسية</a>
        </body>
        </html>
        """
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"خطأ في مسار الاختبار: {str(e)}\n{tb}")
        return f"حدث خطأ: {str(e)}", 500

# إضافة مسار فحص حالة التطبيق لـ Vercel
@app.route('/api/status')
def vercel_status_check():
    """مسار لفحص حالة التطبيق وإعداداته في Vercel"""
    env_vars = {
        "DATABASE_URL": os.environ.get("DATABASE_URL", "").split('@')[0] + '@[HIDDEN]' if os.environ.get("DATABASE_URL") else None,
        "SESSION_SECRET": "***" if os.environ.get("SESSION_SECRET") else None,
        "TELEGRAM_BOT_TOKEN": "***" if os.environ.get("TELEGRAM_BOT_TOKEN") else None,
        "TELEGRAM_CHAT_ID": "***" if os.environ.get("TELEGRAM_CHAT_ID") else None,
        "FLASK_SECRET_KEY": "***" if os.environ.get("FLASK_SECRET_KEY") else None,
        "SENDGRID_API_KEY": "***" if os.environ.get("SENDGRID_API_KEY") else None,
    }
    
    return jsonify({
        "status": "running",
        "environment": os.environ.get("VERCEL_ENV", os.environ.get("FLASK_ENV", "development")),
        "version": "1.0.0",
        "env_vars_status": env_vars
    })

if __name__ == '__main__':
    try:
        app.run(debug=True, host='0.0.0.0')
    except Exception as e:
        logger.error(f"Failed to start application: {str(e)}")
        raise