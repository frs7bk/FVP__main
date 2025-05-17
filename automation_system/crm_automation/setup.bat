@echo off
SETLOCAL

:: التحقق من تثبيت Docker
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo خطأ: Docker غير مثبت على النظام.
    echo يرجى تحميل وتثبيت Docker Desktop من:
    echo https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

:: التحقق من تشغيل Docker
docker ps >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo خطأ: Docker لا يعمل.
    echo يرجى تشغيل Docker Desktop والمحاولة مرة أخرى.
    pause
    exit /b 1
)

echo =======================================
echo    إعداد نظام متابعة العملاء الذكي
echo =======================================
echo.

:: نسخ ملف البيئة إذا لم يكن موجوداً
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo تم إنشاء ملف .env من المثال
    ) else (
        echo تحذير: ملف .env.example غير موجود
    )
)

:: إنشاء المجلدات المطلوبة
if not exist "logs" mkdir "logs"
if not exist "backups\db" mkdir "backups\db"
if not exist "static\uploads" mkdir "static\uploads"

:: تثبيت المتطلبات
echo.
echo جاري تثبيت المتطلبات...
pip install -r requirements.txt

:: بناء الصور
echo.
echo جاري بناء صور Docker...
docker-compose build

:: تشغيل النظام
echo.
echo جاري تشغيل النظام...
docker-compose up -d

echo.
echo =======================================
echo    تم الانتهاء من الإعداد بنجاح!
echo =======================================
echo.
echo يمكنك الوصول إلى النظام عبر:
echo http://localhost:8000
echo.
echo معلومات تسجيل الدخول الافتراضية:
echo البريد الإلكتروني: admin@example.com
echo كلمة المرور: admin123
echo.
echo ملاحظة: يرجى تغيير كلمة المرور بعد تسجيل الدخول لأول مرة.
echo.

:: فتح المتصفح
timeout /t 5
start "" http://localhost:8000

pause
