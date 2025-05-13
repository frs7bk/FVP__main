/**
 * ملف JavaScript لعرض الفيديو في النافذة المنبثقة
 * ملف منفصل لتصحيح المشكلة - نسخة محدثة 2025-05-09
 */

console.log('تم تحميل ملف showVideo.js - نسخة محدثة 2025-05-09');

// دالة لتفعيل أزرار الفيديو في النافذة المنبثقة
function activateVideoButtons() {
    console.log('جاري تفعيل أزرار الفيديو...');
    
    // زر عرض الفيديو (الكبير)
    const showVideoBtn = document.getElementById('show-video-btn');
    if (showVideoBtn) {
        console.log('تم العثور على زر عرض الفيديو الكبير');
        showVideoBtn.onclick = function() {
            console.log('تم النقر على زر عرض الفيديو الكبير');
            showPortfolioVideo();
        };
    } else {
        console.log('لم يتم العثور على زر عرض الفيديو الكبير');
    }
    
    // زر عرض الفيديو (في شريط الأزرار)
    const showVideoBtnInline = document.getElementById('show-video-btn-inline');
    if (showVideoBtnInline) {
        console.log('تم العثور على زر عرض الفيديو في شريط الأزرار');
        showVideoBtnInline.onclick = function() {
            console.log('تم النقر على زر عرض الفيديو في شريط الأزرار');
            showPortfolioVideo();
        };
        
        // التحقق من وجود فيديو وإظهار الزر إذا كان متاحاً
        const hasVideo = document.getElementById('modal-has-video').value === '1';
        showVideoBtnInline.style.display = hasVideo ? 'inline-block' : 'none';
    }
    
    // زر الرجوع للصورة
    const backToImageBtn = document.getElementById('back-to-image-btn');
    if (backToImageBtn) {
        console.log('تم العثور على زر الرجوع للصورة');
        backToImageBtn.onclick = function() {
            console.log('تم النقر على زر الرجوع للصورة');
            hidePortfolioVideo();
        };
    }
}

// دالة عرض الفيديو
function showPortfolioVideo() {
    console.log('جاري عرض الفيديو...');
    
    const imageContainer = document.getElementById('modal-image-container');
    const videoContainer = document.getElementById('modal-video-container');
    const hasVideo = document.getElementById('modal-has-video').value === '1';
    const videoType = document.getElementById('modal-video-type').value;
    const videoUrl = document.getElementById('modal-video-url').value;
    const videoFile = document.getElementById('modal-video-file').value;
    
    console.log('بيانات الفيديو:', { hasVideo, videoType, videoUrl, videoFile });
    
    // التحقق من وجود فيديو
    if (!hasVideo) {
        console.log('لا يوجد فيديو لهذا المشروع');
        alert('لا يوجد فيديو لهذا المشروع');
        return;
    }
    
    // تجهيز الفيديو حسب نوعه
    if (videoType === 'external') {
        console.log('نوع الفيديو: خارجي');
        // عرض الفيديو الخارجي (يوتيوب/فيميو)
        const externalVideoContainer = document.getElementById('modal-external-video-container');
        const externalVideo = document.getElementById('modal-external-video');
        
        // معالجة روابط يوتيوب وفيميو
        let embedUrl = videoUrl;
        if (videoUrl.includes('youtube.com/watch?v=')) {
            const videoId = videoUrl.split('watch?v=')[1].split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('youtu.be/')) {
            const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('vimeo.com/')) {
            const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0];
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
        
        console.log('رابط الفيديو المضمن:', embedUrl);
        
        // تعيين الرابط وإظهار الفيديو
        externalVideo.src = embedUrl;
        externalVideoContainer.style.display = 'block';
        document.getElementById('modal-local-video-container').style.display = 'none';
    } else {
        console.log('نوع الفيديو: محلي');
        // عرض الفيديو المحلي
        const localVideoContainer = document.getElementById('modal-local-video-container');
        const videoSource = document.getElementById('modal-video-source');
        const localVideo = document.getElementById('modal-local-video');
        
        console.log('رابط الفيديو المحلي:', videoFile);
        
        // تعيين مصدر الفيديو وتشغيله
        videoSource.src = videoFile;
        localVideo.load();
        
        localVideoContainer.style.display = 'block';
        document.getElementById('modal-external-video-container').style.display = 'none';
        
        // تشغيل الفيديو تلقائياً بعد التحميل
        localVideo.addEventListener('loadedmetadata', function() {
            try {
                localVideo.play().catch(e => console.log('لم يتم تشغيل الفيديو تلقائياً:', e));
            } catch(err) {
                console.log('خطأ في تشغيل الفيديو:', err);
            }
        });
    }
    
    // إظهار حاوية الفيديو وإخفاء الصورة
    if (imageContainer && videoContainer) {
        imageContainer.style.display = 'none';
        videoContainer.style.display = 'block';
    }
}

// دالة إخفاء الفيديو
function hidePortfolioVideo() {
    console.log('جاري إخفاء الفيديو... (نسخة معدلة 2025-05-09)');
    
    const imageContainer = document.getElementById('modal-image-container');
    const videoContainer = document.getElementById('modal-video-container');
    
    // إيقاف تشغيل الفيديو المحلي إن وجد
    const localVideo = document.getElementById('modal-local-video');
    if (localVideo) {
        console.log('إيقاف الفيديو المحلي');
        try {
            localVideo.pause();
            localVideo.currentTime = 0; // إعادة الفيديو للبداية
        } catch (err) {
            console.error('خطأ في إيقاف الفيديو المحلي:', err);
        }
    }
    
    // إيقاف الفيديو الخارجي (يوتيوب/فيميو)
    const externalVideo = document.getElementById('modal-external-video');
    if (externalVideo) {
        console.log('إيقاف الفيديو الخارجي');
        try {
            // أفضل طريقة لإيقاف فيديو iframe هي تفريغ المصدر
            externalVideo.src = '';
        } catch (err) {
            console.error('خطأ في إيقاف الفيديو الخارجي:', err);
        }
    }
    
    // إخفاء حاويات الفيديو
    if (videoContainer) {
        videoContainer.style.display = 'none';
    }
    
    // حاويات الفيديو الفرعية
    const localVideoContainer = document.getElementById('modal-local-video-container');
    if (localVideoContainer) {
        localVideoContainer.style.display = 'none';
    }
    
    const externalVideoContainer = document.getElementById('modal-external-video-container');
    if (externalVideoContainer) {
        externalVideoContainer.style.display = 'none';
    }
    
    // إظهار الصورة
    if (imageContainer) {
        imageContainer.style.display = 'block';
    }
}

// تفعيل الأزرار عند فتح النافذة المنبثقة
window.addEventListener('click', function(event) {
    if (event.target.closest('[data-portfolio-id]')) {
        console.log('تم النقر على عنصر المشروع');
        
        // إيقاف تشغيل أي فيديو قبل فتح مشروع جديد (نسخة محدثة 2025-05-09)
        hidePortfolioVideo();
        
        // انتظر قليلاً حتى يتم فتح النافذة المنبثقة وتحميل البيانات
        setTimeout(function() {
            console.log('تفعيل أزرار الفيديو للمشروع الجديد');
            activateVideoButtons();
        }, 500);
    }
});

// إضافة دالة لتفعيل الأزرار بعد تحميل النافذة المنبثقة
window.activateModalVideoButtons = activateVideoButtons;

// تفعيل إذا كانت النافذة المنبثقة موجودة بالفعل
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('portfolio-modal');
    if (modal && window.getComputedStyle(modal).display !== 'none') {
        activateVideoButtons();
    }
    
    // إضافة مستمعي أحداث لإغلاق الفيديو مع النافذة المنبثقة
    
    // 1. مستمع لزر الإغلاق
    const closeButton = document.getElementById('close-modal');
    if (closeButton) {
        console.log('تفعيل مستمع زر الإغلاق');
        closeButton.addEventListener('click', function() {
            console.log('تم النقر على زر الإغلاق - إيقاف الفيديو');
            hidePortfolioVideo();
        });
    }
    
    // 2. مستمع للنقر خارج النافذة المنبثقة
    if (modal) {
        console.log('تفعيل مستمع النقر خارج النافذة');
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                console.log('تم النقر خارج النافذة - إيقاف الفيديو');
                hidePortfolioVideo();
            }
        });
    }
    
    // 3. مستمع لمفتاح ESC
    console.log('تفعيل مستمع مفتاح ESC');
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            console.log('تم الضغط على مفتاح ESC - إيقاف الفيديو');
            if (modal && window.getComputedStyle(modal).display !== 'none') {
                hidePortfolioVideo();
            }
        }
    });
});