/**
 * ملف JavaScript مستقل للتعامل مع أزرار الفيديو في النافذة المنبثقة
 * تم إنشاؤه لضمان عمل أزرار الفيديو بشكل صحيح ومستقل عن باقي وظائف النافذة المنبثقة
 */

// دالة للتحقق من وجود فيديو وإظهار أو إخفاء الأزرار المناسبة
function updateVideoButtons(hasVideo = false) {
  console.log('تحديث أزرار الفيديو - hasVideo:', hasVideo);
  
  // تحديث الزر الكبير
  const bigButton = document.getElementById('modal-video-button-container');
  if (bigButton) {
    bigButton.style.display = hasVideo ? 'block' : 'none';
  }
  
  // تحديث الزر في شريط الأزرار
  const inlineButton = document.getElementById('show-video-btn-inline');
  if (inlineButton) {
    // دائماً نعرض الزر في شريط الأزرار، ولكن نضيف فئة "disabled" إذا لم يكن هناك فيديو
    if (hasVideo) {
      inlineButton.style.display = 'inline-flex';
      inlineButton.classList.remove('disabled');
      inlineButton.setAttribute('title', 'عرض فيديو المشروع');
      inlineButton.onclick = function() { showVideo(); };
    } else {
      // إخفاء الزر إذا لم يكن هناك فيديو
      inlineButton.style.display = 'none';
    }
  }
  
  // تحديث الزر المنفصل
  const videoActionBtn = document.getElementById('video-action-btn');
  if (videoActionBtn) {
    videoActionBtn.style.display = hasVideo ? 'block' : 'none';
  }
}

// دالة لإظهار الفيديو (تُستدعى عند النقر على أي من أزرار الفيديو)
function showVideo() {
  console.log('استدعاء دالة showVideo');
  
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

// دالة لإعداد الفيديو الخارجي (يوتيوب/فيميو)
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

// دالة للعودة للصورة
function hideVideo() {
  console.log('استدعاء دالة hideVideo');
  
  const imageContainer = document.getElementById('modal-image-container');
  const videoContainer = document.getElementById('modal-video-container');
  
  if (!imageContainer || !videoContainer) {
    console.error('لم يتم العثور على حاويات الصورة/الفيديو');
    return;
  }
  
  // إيقاف تشغيل الفيديو المحلي إن وجد
  const localVideo = document.getElementById('modal-local-video');
  if (localVideo) {
    localVideo.pause();
  }
  
  // إيقاف الفيديو الخارجي (يوتيوب/فيميو) عن طريق تفريغ الـ src ثم إعادته
  const externalVideo = document.getElementById('modal-external-video');
  if (externalVideo) {
    const currentSrc = externalVideo.src;
    externalVideo.src = '';
    setTimeout(() => { externalVideo.src = currentSrc; }, 10);
  }
  
  // إظهار الصورة وإخفاء الفيديو
  videoContainer.style.display = 'none';
  imageContainer.style.display = 'block';
}

// استدعاء دالة تحديث أزرار الفيديو عند تحميل النافذة المنبثقة
function setupVideoControls() {
  console.log('تهيئة عناصر التحكم بالفيديو');
  
  // إضافة مستمع حدث لزر العودة للصورة
  const backToImageBtn = document.getElementById('back-to-image-btn');
  if (backToImageBtn) {
    backToImageBtn.onclick = hideVideo;
  }
  
  // التحقق من وجود فيديو وتحديث حالة الأزرار
  const hasVideoInput = document.getElementById('modal-has-video');
  if (hasVideoInput) {
    const hasVideo = hasVideoInput.value === '1';
    updateVideoButtons(hasVideo);
  }
}

// إضافة مستمعات الأحداث عند اكتمال تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  console.log('تم تحميل ملف portfolio-video-buttons.js');
  
  // استدعاء دالة الإعداد إذا كانت النافذة المنبثقة مفتوحة بالفعل
  const modal = document.getElementById('portfolio-modal');
  if (modal && window.getComputedStyle(modal).display !== 'none') {
    setupVideoControls();
  }
  
  // إضافة مستمع حدث للنقر على العناصر التي تفتح النافذة المنبثقة
  document.querySelectorAll('[data-portfolio-id]').forEach(element => {
    element.addEventListener('click', function() {
      // استدعاء دالة الإعداد بعد فترة قصيرة للتأكد من تحميل النافذة المنبثقة
      setTimeout(setupVideoControls, 300);
    });
  });
});

// تصدير الدوال للاستخدام العالمي
window.showVideo = showVideo;
window.hideVideo = hideVideo;
window.updateVideoButtons = updateVideoButtons;
window.setupVideoControls = setupVideoControls;