/**
 * معالج دالة فيديو مباشرة
 * نسخة 1.0
 */
console.log('تم تحميل معالج الفيديو المباشر v1.0');

// تعريف دالة عالمية لعرض الفيديو
window.showVideo = function() {
    console.log('تم استدعاء دالة عرض الفيديو المباشرة');
    const hasVideo = document.getElementById('modal-has-video').value === '1';
    
    if (!hasVideo) {
        alert('لا يوجد فيديو لهذا المشروع');
        return;
    }
    
    const imageContainer = document.getElementById('modal-image-container');
    const videoContainer = document.getElementById('modal-video-container');
    const videoType = document.getElementById('modal-video-type').value;
    const videoUrl = document.getElementById('modal-video-url').value;
    const videoFile = document.getElementById('modal-video-file').value;
    
    console.log('بيانات الفيديو:', {
        hasVideo,
        videoType,
        videoUrl,
        videoFile
    });
    
    // إظهار حاوية الفيديو وإخفاء الصورة
    if (imageContainer && videoContainer) {
        imageContainer.style.display = 'none';
        videoContainer.style.display = 'block';
        
        // تجهيز الفيديو حسب نوعه
        if (videoType === 'external') {
            // تجهيز الفيديو الخارجي (يوتيوب/فيميو)
            const externalVideoContainer = document.getElementById('modal-external-video-container');
            const localVideoContainer = document.getElementById('modal-local-video-container');
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
            
            // تعيين الرابط وإظهار الفيديو الخارجي
            externalVideo.src = embedUrl;
            externalVideoContainer.style.display = 'block';
            if (localVideoContainer) localVideoContainer.style.display = 'none';
        } else {
            // تجهيز الفيديو المحلي
            const localVideoContainer = document.getElementById('modal-local-video-container');
            const externalVideoContainer = document.getElementById('modal-external-video-container');
            const videoSource = document.getElementById('modal-video-source');
            const localVideo = document.getElementById('modal-local-video');
            
            console.log('رابط الفيديو المحلي:', videoFile);
            
            // تعيين مصدر الفيديو وتشغيله
            videoSource.src = videoFile;
            localVideo.load();
            
            localVideoContainer.style.display = 'block';
            if (externalVideoContainer) externalVideoContainer.style.display = 'none';
            
            // تشغيل الفيديو تلقائياً بعد التحميل
            localVideo.addEventListener('loadedmetadata', function() {
                try {
                    localVideo.play().catch(e => console.log('لم يتم تشغيل الفيديو تلقائياً:', e));
                } catch(err) {
                    console.log('خطأ في تشغيل الفيديو:', err);
                }
            });
        }
    } else {
        console.error('لم يتم العثور على حاوية الصورة أو الفيديو!');
    }
};

// التحقق من حالة زر الفيديو عند بدء التشغيل
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const videoActionBtn = document.getElementById('video-action-btn');
        const hasVideo = document.getElementById('modal-has-video');
        
        if (videoActionBtn && hasVideo) {
            console.log('التحقق من حالة زر الفيديو المنفصل عند بدء التشغيل');
            videoActionBtn.style.display = hasVideo.value === '1' ? 'block' : 'none';
        }
    }, 500);
    
    // مراقبة تغييرات على المشروع عند فتح النافذة المنبثقة
    document.addEventListener('click', function(event) {
        if (event.target.closest('[data-portfolio-id]')) {
            setTimeout(function() {
                const videoActionBtn = document.getElementById('video-action-btn');
                const hasVideo = document.getElementById('modal-has-video');
                
                if (videoActionBtn && hasVideo) {
                    videoActionBtn.style.display = hasVideo.value === '1' ? 'block' : 'none';
                    console.log('تم تحديث حالة زر الفيديو بعد فتح النافذة المنبثقة');
                }
            }, 500);
        }
    });
});