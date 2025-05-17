@echo off
SETLOCAL

:: إعداد المتغيرات
SET BACKUP_DIR=backups\db
SET TIMESTAMP=%DATE:~-4,4%%DATE:~-7,2%%DATE:~-10,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
SET TIMESTAMP=%TIMESTAMP: =0%
SET BACKUP_FILE=%BACKUP_DIR%\backup_%TIMESTAMP%.sql

:: إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجوداً
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: رسالة بدء النسخ الاحتياطي
echo جاري إنشاء نسخة احتياطية من قاعدة البيانات...

:: تنفيذ أمر النسخ الاحتياطي باستخدام pg_dump
docker-compose exec -T db pg_dump -U postgres crm_automation > "%BACKUP_FILE%"

:: التحقق من نجاح العملية
if %ERRORLEVEL% EQU 0 (
    echo تم إنشاء النسخة الاحتياطية بنجاح: %BACKUP_FILE%
) else (
    echo فشل إنشاء النسخة الاحتياطية
    exit /b 1
)

:: ضغط الملف (اختياري)
:: "C:\Program Files\7-Zip\7z.exe" a "%BACKUP_FILE%.7z" "%BACKUP_FILE%"
:: if %ERRORLEVEL% EQU 0 (
::     del "%BACKUP_FILE%"
::     set BACKUP_FILE=%BACKUP_FILE%.7z
:: )

:: حذف الملفات القديمة (الاحتفاظ بـ 7 أيام فقط)
forfiles /p "%BACKUP_DIR%" /m *.sql /d -7 /c "cmd /c del @path"

:: رسالة النجاح
echo تم الانتهاء من عملية النسخ الاحتياطي

ENDLOCAL
