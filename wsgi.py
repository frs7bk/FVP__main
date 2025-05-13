"""
ملف WSGI لتشغيل التطبيق على خادم الإنتاج مثل Gunicorn والنشر على Vercel

لتشغيل التطبيق باستخدام Gunicorn:
gunicorn --bind 0.0.0.0:8000 wsgi:app
"""

import os
import logging
from main import app

# إعداد التسجيل للمساعدة في تشخيص المشاكل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# وظيفة التصدير التي يستخدمها Vercel
def handler(event, context):
    """تعامل مع طلبات Vercel Serverless Function"""
    try:
        from io import BytesIO
        import base64
        import json
        
        logger.info(f"Vercel request: {event.get('path')}")
        
        # تهيئة طلب WSGI
        environ = {
            'REQUEST_METHOD': event.get('method', 'GET'),
            'SCRIPT_NAME': '',
            'PATH_INFO': event.get('path', '/'),
            'QUERY_STRING': event.get('query', ''),
            'SERVER_NAME': 'vercel',
            'SERVER_PORT': '443',
            'HTTP_HOST': event.get('headers', {}).get('host', 'localhost'),
            'wsgi.version': (1, 0),
            'wsgi.input': BytesIO(),
            'wsgi.errors': BytesIO(),
            'wsgi.multithread': False,
            'wsgi.multiprocess': False,
            'wsgi.run_once': False,
            'wsgi.url_scheme': 'https',
        }
        
        # إضافة الترويسات HTTP
        for key, value in event.get('headers', {}).items():
            key = key.upper().replace('-', '_')
            if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
                key = 'HTTP_' + key
            environ[key] = value
        
        # إضافة محتوى الطلب إذا كان موجوداً
        body = event.get('body', '')
        if body:
            if event.get('isBase64Encoded', False):
                body = base64.b64decode(body)
            else:
                body = body.encode('utf-8')
            environ['CONTENT_LENGTH'] = str(len(body))
            environ['wsgi.input'] = BytesIO(body)
        
        # تنظيف المسار إذا كان يحتوي على سلسلة استعلام
        path_info = environ['PATH_INFO']
        if '?' in path_info:
            path_info, query = path_info.split('?', 1)
            environ['PATH_INFO'] = path_info
            environ['QUERY_STRING'] = query
        
        # تهيئة متغيرات الاستجابة
        response_body = BytesIO()
        status_code = [200]
        headers = []
        
        # دالة مساعدة لإعداد الاستجابة
        def start_response(status, response_headers, exc_info=None):
            status_code[0] = int(status.split()[0])
            headers.extend(response_headers)
            return response_body.write
        
        # تنفيذ التطبيق
        body_data = app(environ, start_response)
        
        # تجميع محتوى الاستجابة
        if body_data:
            for chunk in body_data:
                if chunk:
                    if isinstance(chunk, str):
                        chunk = chunk.encode('utf-8')
                    response_body.write(chunk)
        
        # تنسيق الترويسات للاستجابة
        response_headers = {header[0]: header[1] for header in headers}
        
        # ترميز المحتوى كـ base64 إذا كان يحتوي على بيانات ثنائية
        is_binary = False
        content_type = response_headers.get('Content-Type', '').lower()
        if any(bin_type in content_type for bin_type in ['image/', 'application/octet-stream', 'font/', 'audio/', 'video/']):
            is_binary = True
            response_data = base64.b64encode(response_body.getvalue()).decode('utf-8')
        else:
            try:
                response_data = response_body.getvalue().decode('utf-8')
            except UnicodeDecodeError:
                # إذا فشل الترميز، افترض أنها بيانات ثنائية
                is_binary = True
                response_data = base64.b64encode(response_body.getvalue()).decode('utf-8')
        
        # إعداد الاستجابة النهائية
        return {
            'statusCode': status_code[0],
            'headers': response_headers,
            'body': response_data,
            'isBase64Encoded': is_binary
        }
        
    except Exception as e:
        logger.error(f"Error in Vercel handler: {str(e)}", exc_info=True)
        # إرجاع خطأ 500 في حالة فشل معالجة الطلب
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'text/html'},
            'body': f"<html><body><h1>500 Internal Server Error</h1><p>{str(e)}</p></body></html>"
        }

# تعريف التطبيق للاستخدام في Vercel
application = app

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))