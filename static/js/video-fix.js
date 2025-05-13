/**
 * ملف خاص لإصلاح مشكلة استمرار تشغيل الفيديو عند إغلاق النافذة المنبثقة
 * تاريخ الإنشاء: 2025-05-09
 */

console.log('تم تحميل ملف إصلاح مشكلة الفيديو - النسخة 1.0');

// دالة لإيقاف جميع مقاطع الفيديو المضمنة (يوتيوب، فيميو)
function stopEmbeddedVideos() {
    console.log('جاري إيقاف جميع مقاطع الفيديو المضمنة...');
    
    // إيقاف جميع مقاطع فيديو iframe (يوتيوب، فيميو، إلخ)
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        try {
            // حفظ المصدر الأصلي
            const src = iframe.src;
            // تفريغ المصدر لإيقاف التشغيل
            iframe.src = '';
            // إعادة تحميل المصدر (اختياري - في حالة الحاجة لاستعادة الفيديو لاحقًا)
            // setTimeout(() => { iframe.src = src; }, 10);
        } catch (err) {
            console.error('خطأ في إيقاف الفيديو المضمن:', err);
        }
    });
}

// دالة لإيقاف جميع مقاطع الفيديو المحلية (HTML5 Video)
function stopLocalVideos() {
    console.log('جاري إيقاف جميع مقاطع الفيديو المحلية...');
    
    // إيقاف جميع عناصر الفيديو HTML5
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        try {
            if (!video.paused) {
                video.pause();
            }
            video.currentTime = 0; // إعادة الفيديو للبداية
        } catch (err) {
            console.error('خطأ في إيقاف الفيديو المحلي:', err);
        }
    });
}

// دالة لإيقاف جميع مقاطع الفيديو (المضمنة والمحلية)
function stopAllVideos() {
    console.log('إيقاف جميع مقاطع الفيديو');
    stopEmbeddedVideos();
    stopLocalVideos();
}

// تفعيل الدالة عند إغلاق النافذة المنبثقة
function setupModalCloseHandlers() {
    console.log('إعداد مستمعي أحداث إغلاق النافذة المنبثقة...');
    
    // 1. مستمع لزر الإغلاق
    const closeButton = document.querySelector('#close-modal');
    if (closeButton) {
        console.log('تفعيل مستمع زر الإغلاق للفيديو');
        closeButton.addEventListener('click', function(e) {
            console.log('تم النقر على زر الإغلاق - إيقاف جميع مقاطع الفيديو');
            stopAllVideos();
        });
    }
    
    // 2. مستمع للنقر خارج النافذة المنبثقة
    const modal = document.querySelector('#portfolio-modal');
    if (modal) {
        console.log('تفعيل مستمع النقر خارج النافذة للفيديو');
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                console.log('تم النقر خارج النافذة - إيقاف جميع مقاطع الفيديو');
                stopAllVideos();
            }
        });
    }
    
    // 3. مستمع لمفتاح ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            console.log('تم الضغط على مفتاح ESC - إيقاف جميع مقاطع الفيديو');
            stopAllVideos();
        }
    });
    
    // 4. مستمع للنقر على عناصر المشروع (للتنقل بين المشاريع)
    const portfolioItems = document.querySelectorAll('[data-portfolio-id]');
    portfolioItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('تم النقر على عنصر مشروع آخر - إيقاف جميع مقاطع الفيديو');
            stopAllVideos();
        });
    });
}

// تفعيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تفعيل إصلاح مشكلة الفيديو...');
    setupModalCloseHandlers();
    
    // اختياري: توقف مستمر كل ثانية للتأكد من عدم استمرار تشغيل الفيديو خارج النافذة المنبثقة
    setInterval(function() {
        const modal = document.querySelector('#portfolio-modal');
        if (modal && window.getComputedStyle(modal).display === 'none') {
            stopAllVideos();
        }
    }, 1000);
});

// تفعيل إصلاح آخر للتأكد من إيقاف الفيديو عند إغلاق النافذة المنبثقة أو التنقل بين المشاريع
(function() {
    // تعديل كائن الشاشة المتوفر عالميًا للتأكد من إيقاف الفيديو عند إغلاق النافذة
    const originalCloseModal = window.closePortfolioModal || function(){};
    
    window.closePortfolioModal = function() {
        console.log('إغلاق النافذة المنبثقة - إيقاف جميع مقاطع الفيديو');
        stopAllVideos();
        originalCloseModal();
    };
    
    // تعديل كائن التنقل بين المشاريع إذا كان موجودًا
    const originalNavigateProject = window.navigateToProject || function(){};
    
    window.navigateToProject = function(projectId) {
        console.log('التنقل إلى مشروع آخر - إيقاف جميع مقاطع الفيديو');
        stopAllVideos();
        originalNavigateProject(projectId);
    };
})();