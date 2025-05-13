#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Create a complete deployment package for Render platform
This script creates a ready-to-deploy package containing:
1. Template files only (without images) to reduce package size
2. Fixes for video player and dashboard issues
3. Required Render configuration settings
"""

import os
import zipfile
import logging
import shutil
import tempfile

# إعداد التسجيل
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# القوائم والملفات التي سيتم تضمينها/استبعادها
TEMPLATE_DIRS = ['templates']
STATIC_SUBDIRS = ['css', 'js', 'fonts']
ESSENTIAL_FILES = [
    'app.py',
    'main.py',
    'models.py',
    'database.py',
    'telegram_service.py',
    'email_service.py',
    'render_setup.py',
    'render.yaml',
    'render-requirements.txt',
    'fix_analytics_routes.py',
    'fix_modals.py',
    'fix_modals_register.py',
    'fix_portfolio_modal_routes.py',
    'telegram_test_routes.py',
    'direct_telegram_test.py',
    'fix_admin_access.py',
    'fix_db_missing_columns.py',
]

def create_necessary_fixes():
    """Create missing files and necessary fixes"""
    # 1. Fix visitor notification format issue
    create_visitor_notification_fix()
    
    # 2. Create enhanced-video-stop-manager.js
    create_enhanced_video_manager()
    
    # Add additional files to essential files list
    ESSENTIAL_FILES.append('enhanced-video-stop-manager.js')
    
    logger.info("Created all necessary fix files")

def create_visitor_notification_fix():
    """Fix visitor notification format issue"""
    visitor_fix_code = """
# Fix visitor notification format issue
# This file is called from main.py

import logging
from app import app

logger = logging.getLogger(__name__)

@app.before_first_request
def fix_visitor_notification():
    """Fix visitor notification format issues"""
    try:
        from telegram_service import format_visit_notification, send_new_visitor_notification
        from analytics import track_visitor
        
        # Modify visitor tracking function to match correct function
        original_track_visitor = track_visitor
        
        def fixed_track_visitor(request):
            visitor = original_track_visitor(request)
            if visitor:
                try:
                    # Call notification function with correct information only
                    ip = request.remote_addr
                    user_agent = request.headers.get('User-Agent', '')
                    send_new_visitor_notification(visitor.id, ip, user_agent)
                except Exception as e:
                    logger.error(f"Error sending visitor notification: {str(e)}")
            return visitor
        
        # Replace original function with fixed function
        import analytics
        analytics.track_visitor = fixed_track_visitor
        
        logger.info("Fixed visitor notification format issues")
    except ImportError:
        logger.warning("Required modules for visitor notification fix not found")
    except Exception as e:
        logger.error(f"Error fixing visitor notifications: {str(e)}")
"""
    
    with open('fix_visitor_notification.py', 'w', encoding='utf-8') as f:
        f.write(visitor_fix_code)
    
    # إضافة الملف إلى قائمة الملفات الأساسية
    ESSENTIAL_FILES.append('fix_visitor_notification.py')
    
    logger.info("Created visitor notification fix file")

def create_enhanced_video_manager():
    """Create enhanced video playback manager"""
    video_manager_code = """/**
 * Enhanced Video Playback Manager
 * Solves issues with video stopping when closing modals
 */

// Function to ensure all videos stop when closing a modal
function stopAllVideosInModal() {
    console.log("Stopping all videos in modal");
    
    // Find all video elements on the page
    const allVideos = document.querySelectorAll('video');
    
    // Stop each video
    allVideos.forEach(video => {
        try {
            if (!video.paused) {
                console.log("Stopping video:", video.src);
                video.pause();
            }
            
            // Reset playback time to beginning (optional)
            // video.currentTime = 0;
        } catch (e) {
            console.error("Error while trying to stop video:", e);
        }
    });
    
    // Find iframe elements that may contain YouTube or Vimeo videos
    const iframes = document.querySelectorAll('iframe');
    
    // Stop each video inside iframe
    iframes.forEach(iframe => {
        try {
            // Attempt to send stop message to video
            const src = iframe.src;
            
            // Special handling for YouTube videos
            if (src.includes('youtube.com') || src.includes('youtu.be')) {
                console.log("Stopping YouTube video:", src);
                // Reload iframe to stop video (simplest method)
                iframe.src = iframe.src;
            }
            // Special handling for Vimeo videos
            else if (src.includes('vimeo.com')) {
                console.log("Stopping Vimeo video:", src);
                // Reload iframe to stop video
                iframe.src = iframe.src;
            }
        } catch (e) {
            console.error("Error while trying to stop iframe video:", e);
        }
    });
}

// Add event listeners for modal closing
document.addEventListener('DOMContentLoaded', function() {
    console.log("Enhanced video playback manager loaded");
    
    // Monitor click events on modal close elements
    document.addEventListener('click', function(event) {
        // Check if clicked on any modal close button
        if (event.target.classList.contains('close') || 
            event.target.classList.contains('btn-close') ||
            event.target.closest('.close') || 
            event.target.closest('.btn-close')) {
            console.log("Clicked on close button");
            stopAllVideosInModal();
        }
        
        // Check if clicked outside modal
        if (event.target.classList.contains('modal')) {
            console.log("Clicked outside modal");
            stopAllVideosInModal();
        }
    });
    
    // Monitor modal close events using Bootstrap API
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('hide.bs.modal', function() {
            console.log("Modal close event called from Bootstrap API");
            stopAllVideosInModal();
        });
    });
    
    // Add special handler for buttons that open projects directly from the homepage
    const portfolioLinks = document.querySelectorAll('[data-portfolio-id]');
    portfolioLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Stop any video before opening a new project
            stopAllVideosInModal();
        });
    });
});

// Add extra layer of protection - periodic cleanup
setInterval(function() {
    // Check if all modals are closed
    const openModals = document.querySelectorAll('.modal.show');
    if (openModals.length === 0) {
        // No open modals, ensure all videos are stopped
        stopAllVideosInModal();
    }
}, 5000); // every 5 seconds
"""
    
    # إنشاء المجلد إذا كان غير موجود
    os.makedirs('static/js', exist_ok=True)
    
    with open('static/js/enhanced-video-stop-manager.js', 'w', encoding='utf-8') as f:
        f.write(video_manager_code)
    
    # نسخ الملف أيضًا للمجلد الرئيسي للسهولة
    with open('enhanced-video-stop-manager.js', 'w', encoding='utf-8') as f:
        f.write(video_manager_code)
    
    logger.info("Created enhanced video playback manager file")

def update_main_for_fixes():
    """Update main.py file to include fixes"""
    try:
        if not os.path.exists('main.py'):
            logger.error("ملف main.py غير موجود!")
            return
            
        with open('main.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # إضافة استدعاء إصلاح إشعارات الزوار
        if 'fix_visitor_notification' not in content:
            lines = content.splitlines()
            import_section_end = 0
            
            # البحث عن نهاية استيراد الوحدات
            for i, line in enumerate(lines):
                if line.startswith('import') or line.startswith('from'):
                    import_section_end = i + 1
            
            # إضافة استيراد الإصلاح
            lines.insert(import_section_end, 'from fix_visitor_notification import fix_visitor_notification')
            
            # إعادة كتابة الملف
            with open('main.py', 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines))
            
            logger.info("Updated main.py to call visitor notification fix")
    except Exception as e:
        logger.error(f"خطأ في تحديث ملف main.py: {str(e)}")

def update_templates_for_video_fix():
    """Update template files to include video fix script"""
    try:
        base_templates = [
            'templates/base.html',
            'templates/admin/base.html',
            'templates/base_rtl.html',
            'templates/admin/base_rtl.html',
        ]
        
        for template_path in base_templates:
            if not os.path.exists(template_path):
                continue
                
            with open(template_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # التحقق من وجود سكريبت إصلاح الفيديو
            if 'enhanced-video-stop-manager.js' not in content:
                # إضافة السكريبت قبل وسم الإغلاق </body>
                content = content.replace('</body>', '<script src="{{ url_for(\'static\', filename=\'js/enhanced-video-stop-manager.js\') }}"></script>\n</body>')
                
                # إعادة كتابة الملف
                with open(template_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                logger.info(f"تم تحديث القالب {template_path} لتضمين سكريبت إصلاح الفيديو")
    except Exception as e:
        logger.error(f"خطأ في تحديث ملفات القوالب: {str(e)}")

def create_zip_file():
    """إنشاء ملف ZIP يحتوي على الملفات المطلوبة للنشر"""
    # اسم ملف الحزمة
    zip_filename = 'portfolio_render_ready.zip'
    
    # إنشاء مجلد مؤقت للحزمة
    with tempfile.TemporaryDirectory() as temp_dir:
        logger.info(f"إنشاء مجلد مؤقت: {temp_dir}")
        
        # نسخ الملفات الأساسية
        for file in ESSENTIAL_FILES:
            if os.path.exists(file):
                shutil.copy2(file, os.path.join(temp_dir, file))
                logger.info(f"تم نسخ الملف: {file}")
            else:
                logger.warning(f"الملف غير موجود: {file}")
        
        # نسخ مجلدات القوالب
        for dir_name in TEMPLATE_DIRS:
            if os.path.exists(dir_name):
                shutil.copytree(dir_name, os.path.join(temp_dir, dir_name))
                logger.info(f"تم نسخ المجلد: {dir_name}")
            else:
                logger.warning(f"المجلد غير موجود: {dir_name}")
        
        # نسخ المجلدات الفرعية من static
        static_dir = os.path.join(temp_dir, 'static')
        os.makedirs(static_dir, exist_ok=True)
        
        for subdir in STATIC_SUBDIRS:
            src_dir = os.path.join('static', subdir)
            if os.path.exists(src_dir):
                shutil.copytree(src_dir, os.path.join(static_dir, subdir))
                logger.info(f"تم نسخ المجلد الفرعي: {src_dir}")
            else:
                # إنشاء المجلد إذا كان غير موجود
                os.makedirs(os.path.join(static_dir, subdir), exist_ok=True)
                logger.warning(f"المجلد الفرعي غير موجود، تم إنشاؤه: {src_dir}")
        
        # إنشاء مجلد uploads فارغ
        uploads_dir = os.path.join(static_dir, 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        logger.info("تم إنشاء مجلد uploads")
        
        # إنشاء ملف placeholder.txt في مجلد uploads
        with open(os.path.join(uploads_dir, 'placeholder.txt'), 'w') as f:
            f.write('This folder will store uploaded files.')
        
        # إنشاء مجلد instance فارغ
        instance_dir = os.path.join(temp_dir, 'instance')
        os.makedirs(instance_dir, exist_ok=True)
        logger.info("تم إنشاء مجلد instance")
        
        # إنشاء ملف ZIP
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, temp_dir)
                    zipf.write(file_path, arcname)
                    logger.info(f"تم إضافة الملف إلى الحزمة: {arcname}")
    
    logger.info(f"تم إنشاء حزمة النشر بنجاح: {zip_filename}")
    return zip_filename

def main():
    """الدالة الرئيسية"""
    logger.info("بدء إنشاء حزمة النشر لمنصة Render...")
    
    try:
        # إنشاء الإصلاحات اللازمة
        create_necessary_fixes()
        
        # تحديث ملف main.py
        update_main_for_fixes()
        
        # تحديث ملفات القوالب
        update_templates_for_video_fix()
        
        # إنشاء ملف ZIP
        zip_file = create_zip_file()
        
        logger.info(f"تم الانتهاء من إنشاء حزمة النشر بنجاح: {zip_file}")
        logger.info("الحزمة جاهزة للنشر على منصة Render")
        logger.info("تعليمات النشر:")
        logger.info("1. قم بتحميل الحزمة")
        logger.info("2. استخرج الملفات على جهازك")
        logger.info("3. قم برفع الملفات إلى مستودع Git")
        logger.info("4. قم بإنشاء خدمة Web Service جديدة في Render وربطها بالمستودع")
        logger.info("5. استخدم إعدادات الخدمة التالية:")
        logger.info("   - Build Command: pip install -r render-requirements.txt && python render_setup.py")
        logger.info("   - Start Command: gunicorn --bind 0.0.0.0:$PORT --workers 2 app:app")
        logger.info("6. قم بإعداد متغيرات البيئة التالية:")
        logger.info("   - DATABASE_URL: عنوان قاعدة البيانات PostgreSQL")
        logger.info("   - FLASK_SECRET_KEY: مفتاح سري عشوائي")
        logger.info("   - SESSION_SECRET: مفتاح سري للجلسات")
        
    except Exception as e:
        logger.error(f"حدث خطأ أثناء إنشاء حزمة النشر: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    main()