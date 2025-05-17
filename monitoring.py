import logging
from logging.handlers import SMTPHandler, RotatingFileHandler
import os
from flask import Flask, request
import telegram
from telegram.error import TelegramError
import traceback

class MonitoringSystem:
    def __init__(self, app=None):
        self.app = app
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.chat_id = os.getenv('TELEGRAM_CHAT_ID')
        
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        # تكوين نظام التسجيل
        if not os.path.exists('logs'):
            os.mkdir('logs')
            
        # تسجيل الأخطاء في ملف
        file_handler = RotatingFileHandler('logs/error.log', maxBytes=10240, backupCount=10)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
        file_handler.setLevel(logging.INFO)
        
        # إرسال الأخطاء الخطيرة بالبريد الإلكتروني
        if app.config['MAIL_SERVER']:
            auth = None
            if app.config['MAIL_USERNAME'] or app.config['MAIL_PASSWORD']:
                auth = (app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
            secure = None
            if app.config['MAIL_USE_TLS']:
                secure = ()
            mail_handler = SMTPHandler(
                mailhost=(app.config['MAIL_SERVER'], app.config['MAIL_PORT']),
                fromaddr=app.config['MAIL_USERNAME'],
                toaddrs=app.config['ADMINS'],
                subject='Application Error',
                credentials=auth,
                secure=secure)
            mail_handler.setLevel(logging.ERROR)
            app.logger.addHandler(mail_handler)
        
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Application startup')
        
        # معالج الأخطاء العام
        @app.errorhandler(Exception)
        def handle_exception(e):
            # تسجيل الخطأ
            tb = traceback.format_exc()
            error_msg = f"""
            خطأ غير متوقع: {str(e)}\n\n
            الطلب: {request.method} {request.path}\n
            المعاملات: {request.args}\n
            البيانات: {request.get_data()}\n\n
            التتبع:
            {tb}
            """
            
            app.logger.error(error_msg)
            self.send_telegram_alert(f"❌ خطأ في التطبيق:\n{str(e)}\n\n{request.method} {request.path}")
            
            return "حدث خطأ داخلي"
    
    def send_telegram_alert(self, message):
        """إرسال تنبيه عبر تيليجرام"""
        if not all([self.bot_token, self.chat_id]):
            return
            
        try:
            bot = telegram.Bot(token=self.bot_token)
            bot.send_message(chat_id=self.chat_id, text=message[:4000])  # الحد الأقصى لطول الرسالة
        except TelegramError as e:
            self.app.logger.error(f"فشل إرسال تنبيه تيليجرام: {str(e)}")
    
    def log_activity(self, user_id, action, details=None):
        """تسجيل نشاط المستخدم"""
        log_msg = f"نشاط المستخدم: user_id={user_id}, action={action}"
        if details:
            log_msg += f", details={details}"
        self.app.logger.info(log_msg)

# لاستخدام النظام في التطبيق:
# monitoring = MonitoringSystem(app)
# monitoring.log_activity(current_user.id, 'login', {'ip': request.remote_addr})
