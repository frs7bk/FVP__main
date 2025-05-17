# استخدام صورة Python الرسمية كلقاعدة
FROM python:3.10-slim

# تعيين متغيرات البيئة
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PIP_NO_CACHE_DIR=off

# إنشاء مجلد التطبيق
WORKDIR /app

# تثبيت متطلبات النظام
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# نسخ ملفات المشروع
COPY . .

# تثبيت متطلبات Python
RUN pip install --no-cache-dir -r requirements.txt

# إنشاء مستخدم غير جذري
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# تعيين الأمر الافتراضي
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
