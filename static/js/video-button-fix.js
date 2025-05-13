/**
 * إصلاح سريع لزر الفيديو في النافذة المنبثقة
 */

// دالة للتحقق من وجود فيديو وتنشيط زر عرض الفيديو
function fixVideoButton() {
  // مؤقت للتحقق باستمرار
  function checkAndActivateVideoButton() {
    try {
      // زر الفيديو المنفصل
      const inlineButton = document.getElementById('show-video-btn-inline');
      const hasVideoInput = document.getElementById('modal-has-video');
      
      if (inlineButton && hasVideoInput) {
        // التحقق من وجود فيديو
        const hasVideo = hasVideoInput.value === '1';
        
        // تحديث حالة زر الفيديو
        inlineButton.style.display = hasVideo ? 'inline-flex' : 'none';
        
        // إضافة حدث النقر لعرض الفيديو
        inlineButton.onclick = function() {
          showVideoContent();
        };
        
        console.log('تم إصلاح زر الفيديو - حالة الفيديو:', hasVideo);
      }
      
      // زر مشاهدة الفيديو المنفصل
      const videoActionBtn = document.getElementById('video-action-btn');
      if (videoActionBtn && hasVideoInput) {
        const hasVideo = hasVideoInput.value === '1';
        videoActionBtn.style.display = hasVideo ? 'block' : 'none';
      }
    } catch (error) {
      console.log('خطأ في تفعيل زر الفيديو:', error);
    }
  }
  
  // دالة لعرض الفيديو
  function showVideoContent() {
    try {
      const imageContainer = document.getElementById('modal-image-container');
      const videoContainer = document.getElementById('modal-video-container');
      
      if (!imageContainer || !videoContainer) {
        return;
      }
      
      // الحصول على بيانات الفيديو
      const hasVideoInput = document.getElementById('modal-has-video');
      const videoTypeInput = document.getElementById('modal-video-type');
      const videoUrlInput = document.getElementById('modal-video-url');
      const videoFileInput = document.getElementById('modal-video-file');
      
      if (!hasVideoInput || !videoTypeInput) {
        return;
      }
      
      const hasVideo = hasVideoInput.value === '1';
      const videoType = videoTypeInput.value;
      const videoUrl = videoUrlInput ? videoUrlInput.value : '';
      const videoFile = videoFileInput ? videoFileInput.value : '';
      
      // التحقق من وجود فيديو
      if (!hasVideo) {
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
    } catch (error) {
      console.log('خطأ في عرض الفيديو:', error);
    }
  }
  
  // دالة لإعداد الفيديو الخارجي (يوتيوب/فيميو)
  function setupExternalVideo(videoUrl) {
    const externalVideoContainer = document.getElementById('modal-external-video-container');
    const externalVideo = document.getElementById('modal-external-video');
    const localVideoContainer = document.getElementById('modal-local-video-container');
    
    if (!externalVideoContainer || !externalVideo || !localVideoContainer) {
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
    
    // تعيين الرابط وإظهار الفيديو
    externalVideo.src = embedUrl;
    externalVideoContainer.style.display = 'block';
    localVideoContainer.style.display = 'none';
  }
  
  // دالة لإعداد الفيديو المحلي
  function setupLocalVideo(videoFile) {
    const localVideoContainer = document.getElementById('modal-local-video-container');
    const videoSource = document.getElementById('modal-video-source');
    const localVideo = document.getElementById('modal-local-video');
    const externalVideoContainer = document.getElementById('modal-external-video-container');
    
    if (!localVideoContainer || !videoSource || !localVideo || !externalVideoContainer) {
      return;
    }
    
    // تعيين مصدر الفيديو وتشغيله
    videoSource.src = videoFile;
    localVideo.load();
    
    localVideoContainer.style.display = 'block';
    externalVideoContainer.style.display = 'none';
  }
  
  // الانتظار قليلاً قبل التشغيل الأول
  setTimeout(checkAndActivateVideoButton, 500);
  
  // ثم مراقبة كل ثانية
  setInterval(checkAndActivateVideoButton, 1000);
}

// تفعيل الإصلاح عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', fixVideoButton);

// تصدير دالة عرض الفيديو
window.showVideo = function() {
  const imageContainer = document.getElementById('modal-image-container');
  const videoContainer = document.getElementById('modal-video-container');
  
  if (imageContainer && videoContainer) {
    imageContainer.style.display = 'none';
    videoContainer.style.display = 'block';
    
    // إعداد الفيديو المناسب
    const hasVideo = document.getElementById('modal-has-video').value === '1';
    const videoType = document.getElementById('modal-video-type').value;
    
    if (hasVideo) {
      if (videoType === 'external') {
        const videoUrl = document.getElementById('modal-video-url').value;
        const externalVideoContainer = document.getElementById('modal-external-video-container');
        const externalVideo = document.getElementById('modal-external-video');
        const localVideoContainer = document.getElementById('modal-local-video-container');
        
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
        
        externalVideo.src = embedUrl;
        externalVideoContainer.style.display = 'block';
        localVideoContainer.style.display = 'none';
      } else {
        const videoFile = document.getElementById('modal-video-file').value;
        const localVideoContainer = document.getElementById('modal-local-video-container');
        const videoSource = document.getElementById('modal-video-source');
        const localVideo = document.getElementById('modal-local-video');
        const externalVideoContainer = document.getElementById('modal-external-video-container');
        
        videoSource.src = videoFile;
        localVideo.load();
        
        localVideoContainer.style.display = 'block';
        externalVideoContainer.style.display = 'none';
      }
    }
  }
};