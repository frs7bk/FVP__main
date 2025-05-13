/**
 * ملف JavaScript خاص بإظهار الفيديو في النافذة المنبثقة
 */

// تعريف عالمي للتحقق من تحميل الملف 
window.modalVideoLoaded = true;
console.log('تم تحميل ملف modal-video.js');

// تنفيذ الإعداد فوراً + إضافة مستمعات الأحداث عند اكتمال تحميل المستند
function setupVideoControls() {
    console.log('إعداد عناصر التحكم بالفيديو...');
    
    // البحث عن زر عرض الفيديو
    const showVideoBtn = document.getElementById('show-video-btn');
    console.log('زر عرض الفيديو موجود:', !!showVideoBtn);
    
    if (showVideoBtn) {
        showVideoBtn.addEventListener('click', function() {
            console.log('تم النقر على زر عرض الفيديو');
            // تفعيل عرض الفيديو
            showVideo();
        });
    }
    
    // إضافة وتهيئة زر الفيديو في شريط الأزرار إذا لم يكن موجوداً
    const modalActionsContainer = document.querySelector('.modal-actions');
    let videoBtnInline = document.getElementById('show-video-btn-inline');
    
    if (modalActionsContainer && !videoBtnInline) {
        console.log('إنشاء زر فيديو في شريط الأزرار');
        // إنشاء زر جديد
        videoBtnInline = document.createElement('button');
        videoBtnInline.id = 'show-video-btn-inline';
        videoBtnInline.type = 'button';
        videoBtnInline.innerHTML = '<i class="fas fa-play-circle"></i>';
        videoBtnInline.style.backgroundColor = '#28a745';
        videoBtnInline.style.color = 'white';
        videoBtnInline.style.border = 'none';
        videoBtnInline.style.borderRadius = '4px';
        videoBtnInline.style.margin = '0 5px';
        videoBtnInline.style.padding = '8px 12px';
        
        // إخفاء الزر بشكل افتراضي
        videoBtnInline.style.display = 'none';
        
        // إضافة تأثير التوهج
        videoBtnInline.style.animation = 'glow 1.5s infinite alternate';
        
        // إضافة مستمع الحدث
        videoBtnInline.addEventListener('click', function() {
            console.log('تم النقر على زر الفيديو في شريط الأزرار');
            showVideo();
        });
        
        // إضافة الزر إلى الحاوية (قبل الزر الأخير)
        if (modalActionsContainer.childElementCount > 0) {
            modalActionsContainer.insertBefore(videoBtnInline, modalActionsContainer.lastElementChild);
        } else {
            modalActionsContainer.appendChild(videoBtnInline);
        }
        
        // التحقق من وجود فيديو وإظهار الزر إن كان متاحاً
        const hasVideo = document.getElementById('modal-has-video');
        if (hasVideo && hasVideo.value === '1') {
            videoBtnInline.style.display = 'inline-block';
        }
    }

    // زر الرجوع إلى الصورة
    const backToImageBtn = document.getElementById('back-to-image-btn');
    console.log('زر العودة للصورة موجود:', !!backToImageBtn);
    
    if (backToImageBtn) {
        backToImageBtn.addEventListener('click', function() {
            console.log('تم النقر على زر العودة للصورة');
            // الرجوع إلى الصورة
            hideVideo();
        });
    }
}

// استدعاء الدالة عند اكتمال تحميل المستند
document.addEventListener('DOMContentLoaded', setupVideoControls);

// استدعاء الدالة فوراً في حال تم تحميل الملف بعد اكتمال تحميل الصفحة
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('تم تحميل الصفحة بالفعل، إعداد عناصر التحكم فوراً...');
    setTimeout(setupVideoControls, 100);
}

/**
 * إظهار الفيديو وإخفاء الصورة
 */
function showVideo() {
    console.log("تشغيل عرض الفيديو");
    const imageContainer = document.getElementById('modal-image-container');
    const videoContainer = document.getElementById('modal-video-container');
    const hasVideo = document.getElementById('modal-has-video').value === '1';
    const videoType = document.getElementById('modal-video-type').value;
    const videoUrl = document.getElementById('modal-video-url').value;
    const videoFile = document.getElementById('modal-video-file').value;

    // التحقق من وجود فيديو
    if (!hasVideo) {
        console.log("لا يوجد فيديو لهذا المشروع");
        return;
    }

    // تجهيز الفيديو حسب نوعه (خارجي أو محلي)
    if (videoType === 'external') {
        // تجهيز الفيديو الخارجي
        const externalVideoContainer = document.getElementById('modal-external-video-container');
        const externalVideo = document.getElementById('modal-external-video');
        
        // معالجة روابط يوتيوب
        let embedUrl = videoUrl;
        if (videoUrl.includes('youtube.com/watch?v=')) {
            const videoId = videoUrl.split('watch?v=')[1].split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('youtu.be/')) {
            const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('vimeo.com/')) {
            // معالجة روابط فيميو
            const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0];
            embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }

        // تعيين الرابط
        externalVideo.src = embedUrl;
        externalVideoContainer.style.display = 'block';
        document.getElementById('modal-local-video-container').style.display = 'none';
    } else {
        // تجهيز الفيديو المحلي
        const localVideoContainer = document.getElementById('modal-local-video-container');
        const videoSource = document.getElementById('modal-video-source');
        
        // تعيين مصدر الفيديو
        videoSource.src = videoFile;
        // إعادة تحميل الفيديو
        document.getElementById('modal-local-video').load();
        
        localVideoContainer.style.display = 'block';
        document.getElementById('modal-external-video-container').style.display = 'none';
    }

    // إظهار حاوية الفيديو وإخفاء الصورة
    if (imageContainer && videoContainer) {
        imageContainer.style.display = 'none';
        videoContainer.style.display = 'block';
    }
}

/**
 * إخفاء الفيديو وإظهار الصورة
 */
function hideVideo() {
    console.log("إخفاء الفيديو");
    const imageContainer = document.getElementById('modal-image-container');
    const videoContainer = document.getElementById('modal-video-container');
    
    // إيقاف تشغيل الفيديو المحلي إن وجد
    const localVideo = document.getElementById('modal-local-video');
    if (localVideo) {
        localVideo.pause();
    }
    
    // إزالة src من الفيديو الخارجي لإيقافه
    const externalVideo = document.getElementById('modal-external-video');
    if (externalVideo) {
        const currentSrc = externalVideo.src;
        externalVideo.src = '';
        setTimeout(() => { externalVideo.src = currentSrc; }, 10);
    }
    
    // إظهار حاوية الصورة وإخفاء الفيديو
    if (imageContainer && videoContainer) {
        videoContainer.style.display = 'none';
        imageContainer.style.display = 'block';
    }
}

/**
 * تحديث حالة زر الفيديو بناءً على وجود فيديو
 */
function updateVideoButtonVisibility(hasVideo) {
    console.log('تحديث حالة أزرار الفيديو - hasVideo:', hasVideo);
    
    // تحديث حالة زر الفيديو الكبير
    const videoButtonContainer = document.getElementById('modal-video-button-container');
    if (videoButtonContainer) {
        videoButtonContainer.style.display = hasVideo ? 'block' : 'none';
        console.log('تم تحديث زر الفيديو الكبير');
    }
    
    // تحديث حالة زر الفيديو المنفصل
    const videoActionBtn = document.getElementById('video-action-btn');
    if (videoActionBtn) {
        videoActionBtn.style.display = hasVideo ? 'block' : 'none';
        console.log('تم تحديث زر الفيديو المنفصل - العرض:', hasVideo ? 'ظاهر' : 'مخفي');
    } else {
        console.log('لم يتم العثور على زر الفيديو المنفصل');
    }
    
    // تحديث حالة زر الفيديو في شريط الأزرار (للتوافق مع النسخ القديمة)
    const showVideoBtnInline = document.getElementById('show-video-btn-inline');
    if (showVideoBtnInline) {
        showVideoBtnInline.style.display = hasVideo ? 'inline-block' : 'none';
    }
}

// إضافة دالة عامة لتعيين بيانات المشروع في النافذة المنبثقة
window.setModalData = function(data) {
    // تعيين البيانات الأساسية
    document.getElementById('modal-title').textContent = data.title || '';
    document.getElementById('modal-category').textContent = data.category || '';
    document.getElementById('modal-description').innerHTML = data.description || '';
    document.getElementById('modal-date').textContent = data.created_at ? formatDate(data.created_at) : '';
    document.getElementById('modal-image').src = data.image_url || '';
    document.getElementById('modal-item-id').value = data.id || '';
    
    // تعيين أعداد الإعجابات والمشاهدات
    document.getElementById('modal-likes').textContent = (data.likes_count || 0) + ' إعجاب';
    document.getElementById('modal-views').textContent = (data.views_count || 0) + ' مشاهدة';
    
    // رابط المشروع
    const linkContainer = document.getElementById('modal-link-container');
    const modalLink = document.getElementById('modal-link');
    if (linkContainer && modalLink && data.external_url) {
        modalLink.href = data.external_url;
        linkContainer.style.display = 'block';
    } else if (linkContainer) {
        linkContainer.style.display = 'none';
    }
    
    // تعيين بيانات الفيديو
    const hasVideo = data.video_type && (data.video_url || data.video_file);
    document.getElementById('modal-has-video').value = hasVideo ? '1' : '0';
    document.getElementById('modal-video-type').value = data.video_type || '';
    document.getElementById('modal-video-url').value = data.video_url || '';
    document.getElementById('modal-video-file').value = data.video_file || '';
    
    // تحديث حالة زر الفيديو
    updateVideoButtonVisibility(hasVideo);
};

/**
 * تنسيق التاريخ
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
}