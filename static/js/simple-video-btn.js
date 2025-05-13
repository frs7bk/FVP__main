/**
 * ملف JavaScript مبسط لإظهار زر الفيديو في النافذة المنبثقة
 */

// تنفيذ الكود عند اكتمال تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  console.log('تم تحميل ملف simple-video-btn.js');
  
  // إضافة مستمع أحداث للنقر على عناصر المعرض
  setupPortfolioItemsClick();
  
  // إعداد مستمعات أحداث زر العودة للصورة
  setupBackToImageButtons();
});

// إعداد مستمع النقر لعناصر المعرض
function setupPortfolioItemsClick() {
  document.querySelectorAll('.portfolio-item').forEach(function(item) {
    item.addEventListener('click', function() {
      // بعد فتح النافذة المنبثقة، نقوم بتهيئة زر الفيديو
      setTimeout(setupVideoButton, 500);
    });
  });
}

// دالة لتهيئة زر الفيديو
function setupVideoButton() {
  console.log('تهيئة زر الفيديو');
  
  // حقل يشير إلى وجود فيديو
  const hasVideoInput = document.getElementById('modal-has-video');
  if (!hasVideoInput) {
    console.log('لم يتم العثور على حقل hasVideo');
    return;
  }
  
  // تحديد ما إذا كان هناك فيديو
  const hasVideo = hasVideoInput.value === '1';
  console.log('القيمة الحالية لـ modal-has-video:', hasVideoInput.value);
  console.log('هل يوجد فيديو؟', hasVideo);
  
  // زر الفيديو في شريط الأزرار
  const inlineVideoBtn = document.getElementById('show-video-btn-inline');
  if (inlineVideoBtn) {
    // إظهار أو إخفاء زر الفيديو بناءً على وجود فيديو
    inlineVideoBtn.style.display = hasVideo ? 'inline-flex' : 'none';
    
    // تعيين حدث النقر لزر الفيديو
    inlineVideoBtn.onclick = function() {
      console.log('تم النقر على زر الفيديو الصغير');
      displayVideo();
    };
  }
  
  // زر الفيديو الكبير (إن وجد)
  const bigVideoBtn = document.getElementById('show-video-btn');
  if (bigVideoBtn) {
    // إظهار أو إخفاء حاوية زر الفيديو
    const container = document.getElementById('modal-video-button-container');
    if (container) {
      container.style.display = hasVideo ? 'block' : 'none';
    }
    
    // تعيين حدث النقر لزر الفيديو
    bigVideoBtn.onclick = function() {
      console.log('تم النقر على زر الفيديو الكبير');
      displayVideo();
    };
  }
  
  // زر الفيديو المنفصل (إن وجد)
  const videoActionBtn = document.getElementById('video-action-btn');
  if (videoActionBtn) {
    videoActionBtn.style.display = hasVideo ? 'block' : 'none';
    
    // تعيين حدث النقر لزر الفيديو
    const actionButton = videoActionBtn.querySelector('button');
    if (actionButton) {
      actionButton.onclick = function() {
        console.log('تم النقر على زر مشاهدة الفيديو المنفصل');
        displayVideo();
      };
    }
  }
  
  // تهيئة زر العودة للصورة
  setupBackToImageButtons();
}

// دالة لعرض الفيديو
function displayVideo() {
  console.log('عرض الفيديو');
  
  const imageContainer = document.getElementById('modal-image-container');
  const videoContainer = document.getElementById('modal-video-container');
  
  if (!imageContainer || !videoContainer) {
    console.error('لم يتم العثور على حاويات الصورة/الفيديو');
    return;
  }
  
  // الحصول على بيانات الفيديو
  const hasVideoInput = document.getElementById('modal-has-video');
  const videoTypeInput = document.getElementById('modal-video-type');
  const videoUrlInput = document.getElementById('modal-video-url');
  const videoFileInput = document.getElementById('modal-video-file');
  
  if (!hasVideoInput || !videoTypeInput) {
    console.error('لم يتم العثور على حقول بيانات الفيديو');
    return;
  }
  
  const hasVideo = hasVideoInput.value === '1';
  const videoType = videoTypeInput.value;
  const videoUrl = videoUrlInput ? videoUrlInput.value : '';
  const videoFile = videoFileInput ? videoFileInput.value : '';
  
  console.log('بيانات الفيديو:', { hasVideo, videoType, videoUrl, videoFile });
  
  // التحقق من وجود فيديو
  if (!hasVideo) {
    console.warn('لا يوجد فيديو لهذا العنصر');
    return;
  }
  
  // إعداد الفيديو حسب نوعه
  if (videoType === 'external') {
    setupExternalVideo(videoUrl);
  } else {
    setupLocalVideo(videoFile);
  }
  
  // إظهار حاوية الفيديو وإخفاء الصورة
  imageContainer.style.display = 'none';
  videoContainer.style.display = 'block';
}

// دالة لإعداد الفيديو الخارجي
function setupExternalVideo(videoUrl) {
  console.log('إعداد الفيديو الخارجي:', videoUrl);
  
  const externalVideoContainer = document.getElementById('modal-external-video-container');
  const externalVideo = document.getElementById('modal-external-video');
  const localVideoContainer = document.getElementById('modal-local-video-container');
  
  if (!externalVideoContainer || !externalVideo || !localVideoContainer) {
    console.error('لم يتم العثور على عناصر الفيديو الخارجي');
    return;
  }
  
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
  localVideoContainer.style.display = 'none';
}

// دالة لإعداد الفيديو المحلي
function setupLocalVideo(videoFile) {
  console.log('إعداد الفيديو المحلي:', videoFile);
  
  const localVideoContainer = document.getElementById('modal-local-video-container');
  const videoSource = document.getElementById('modal-video-source');
  const localVideo = document.getElementById('modal-local-video');
  const externalVideoContainer = document.getElementById('modal-external-video-container');
  
  if (!localVideoContainer || !videoSource || !localVideo || !externalVideoContainer) {
    console.error('لم يتم العثور على عناصر الفيديو المحلي');
    return;
  }
  
  // تعيين مصدر الفيديو وتشغيله
  videoSource.src = videoFile;
  localVideo.load();
  
  localVideoContainer.style.display = 'block';
  externalVideoContainer.style.display = 'none';
}

// دالة للرجوع إلى عرض الصورة
function backToImage() {
  console.log('العودة لعرض الصورة');
  
  const imageContainer = document.getElementById('modal-image-container');
  const videoContainer = document.getElementById('modal-video-container');
  
  if (!imageContainer || !videoContainer) {
    console.error('لم يتم العثور على حاويات الصورة/الفيديو');
    return;
  }
  
  // استخدام دالة إيقاف جميع الفيديوهات المحسنة
  stopAllVideos();
  
  // إخفاء حاويات الفيديو
  videoContainer.style.display = 'none';
  
  const localVideoContainer = document.getElementById('modal-local-video-container');
  if (localVideoContainer) {
    localVideoContainer.style.display = 'none';
  }
  
  const externalVideoContainer = document.getElementById('modal-external-video-container');
  if (externalVideoContainer) {
    externalVideoContainer.style.display = 'none';
  }
  
  // إظهار الصورة
  imageContainer.style.display = 'block';
  
  // استدعاء مدير إيقاف تشغيل الفيديو إذا كان متاحًا
  if (window.portfolioVideoStopManager && window.portfolioVideoStopManager.stopAllVideos) {
    window.portfolioVideoStopManager.stopAllVideos();
  }
  
  // استدعاء مدير إيقاف الفيديو المحسن إذا كان متاحًا
  if (window.VideoStopController && window.VideoStopController.stopAllVideos) {
    window.VideoStopController.stopAllVideos();
  }
}

// دالة إيقاف جميع الفيديوهات - نسخة محسنة
function stopAllVideos() {
  console.log('إيقاف جميع الفيديوهات');
  
  try {
    // 1. إيقاف الفيديو المحلي
    const localVideo = document.getElementById('modal-local-video');
    if (localVideo) {
      if (localVideo.tagName === 'VIDEO') {
        // إذا كان عنصر الفيديو مباشرة
        localVideo.pause();
        localVideo.currentTime = 0;
        // إزالة المصدر
        if (localVideo.src) {
          const originalSrc = localVideo.src;
          localVideo.src = '';
          localVideo.load();
        }
      } else {
        // إذا كان حاوية تحتوي على فيديو
        const videoElement = localVideo.querySelector('video');
        if (videoElement) {
          videoElement.pause();
          videoElement.currentTime = 0;
          if (videoElement.src) {
            const originalSrc = videoElement.src;
            videoElement.src = '';
            videoElement.load();
          }
        }
        // تفريغ المحتوى
        localVideo.innerHTML = '';
      }
    }
    
    // 2. إيقاف الفيديو الخارجي
    const externalVideo = document.getElementById('modal-external-video');
    if (externalVideo) {
      const iframe = externalVideo.querySelector('iframe');
      if (iframe) {
        try {
          // يوتيوب
          if (iframe.src && iframe.src.includes('youtube')) {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            iframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
          }
          // فيميو
          else if (iframe.src && iframe.src.includes('vimeo')) {
            iframe.contentWindow.postMessage('{"method":"pause"}', '*');
          }
          
          // طريقة عامة - إعادة تحميل الإطار
          const originalSrc = iframe.src;
          iframe.src = '';
          
          // لا نعيد المصدر الأصلي لمنع إعادة التحميل
        } catch (e) {
          console.error('خطأ في إيقاف الفيديو الخارجي:', e);
        }
      }
      
      // تفريغ المحتوى
      externalVideo.innerHTML = '';
    }
    
    // 3. إيقاف جميع مشغلات الفيديو المعروفة
    document.querySelectorAll('video, iframe').forEach(element => {
      if (element.tagName === 'VIDEO') {
        try {
          element.pause();
          element.currentTime = 0;
          if (element.src) {
            const originalSrc = element.src;
            element.src = '';
            element.load();
          }
        } catch (e) {
          console.error('خطأ في إيقاف عنصر فيديو:', e);
        }
      } else if (element.tagName === 'IFRAME') {
        try {
          const originalSrc = element.src || '';
          if (originalSrc && (originalSrc.includes('youtube') || originalSrc.includes('vimeo'))) {
            element.src = '';
          }
        } catch (e) {
          console.error('خطأ في إيقاف iframe:', e);
        }
      }
    });
    
    console.log('تم إيقاف جميع الفيديوهات بنجاح');
    
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء محاولة إيقاف جميع الفيديوهات:', error);
    return false;
  }
}

// تهيئة أزرار العودة للصورة
function setupBackToImageButtons() {
  const backButton = document.getElementById('back-to-image-btn');
  if (backButton) {
    backButton.onclick = function() {
      backToImage();
    };
  }
}

// تصدير الدوال للاستخدام من قبل عناصر HTML مباشرة
window.showVideo = displayVideo;
window.setupVideoButton = setupVideoButton;
window.backToImage = backToImage;