/**
 * ملف جافاسكريبت للنافذة المنبثقة بنمط إنستغرام
 */

// المتغيرات العامة
let currentPortfolioId = null;
let modalInitialized = false;

// تنفيذ بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // إنشاء النافذة المنبثقة إذا لم تكن موجودة
  if (!document.getElementById('instagram-modal')) {
    initInstagramModal();
  }
  
  // إضافة مستمعات الأحداث لعناصر المعرض
  setupPortfolioItemEvents();
});

/**
 * إنشاء هيكل النافذة المنبثقة
 */
function initInstagramModal() {
  if (modalInitialized) return;
  
  // إنشاء عنصر النافذة المنبثقة
  const modal = document.createElement('div');
  modal.id = 'instagram-modal';
  
  // إضافة المحتوى الداخلي للنافذة
  modal.innerHTML = `
    <button id="instagram-modal-close">&times;</button>
    <div class="instagram-modal-container">
      <!-- صورة المشروع -->
      <div id="modal-image-container" class="instagram-modal-image">
        <img id="modal-portfolio-image" src="" alt="صورة المشروع">
      </div>
      
      <!-- حاوية الفيديو (مخفية افتراضيًا) -->
      <div id="modal-video-container" class="instagram-modal-image" style="display:none; background-color: #000;">
        <!-- فيديو محلي -->
        <div id="modal-local-video-container" style="display:none; width: 100%; height: 100%;">
          <video id="modal-local-video" controls style="width: 100%; height: 100%; max-height: 90%; margin: auto;">
            <source id="modal-video-source" src="" type="video/mp4">
            متصفحك لا يدعم عرض الفيديو.
          </video>
        </div>
        
        <!-- فيديو خارجي (YouTube, Vimeo, إلخ) -->
        <div id="modal-external-video-container" style="display:none; width: 100%; height: 100%;">
          <iframe id="modal-external-video" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 90%;"></iframe>
        </div>
      </div>
      
      <!-- تفاصيل المشروع -->
      <div class="instagram-modal-details">
        <!-- رأس التفاصيل -->
        <div class="instagram-modal-header">
          <div class="modal-project-info">
            <div id="modal-project-title" class="modal-project-title"></div>
            <div id="modal-project-category" class="modal-project-category"></div>
          </div>
        </div>
        
        <!-- أزرار التفاعل -->
        <div class="instagram-modal-actions">
          <button id="modal-like-button" class="instagram-modal-action-button" title="أضف إعجاب">
            <i class="far fa-heart"></i> إعجاب
          </button>
          <button id="modal-share-button" class="instagram-modal-action-button" title="مشاركة الرابط">
            <i class="fas fa-share-alt"></i> مشاركة
          </button>
          <button id="modal-video-button" class="instagram-modal-action-button" title="مشاهدة الفيديو" style="display:none;">
            <i class="fas fa-play-circle"></i> فيديو
          </button>
          <a id="modal-external-link" href="#" target="_blank" class="instagram-modal-action-button" title="فتح الرابط الخارجي">
            <i class="fas fa-external-link-alt"></i> عرض
          </a>
        </div>
        
        <!-- إحصائيات المشروع -->
        <div class="instagram-modal-stats">
          <div id="modal-views-count" class="instagram-modal-stat"><i class="fas fa-eye"></i> <span>0</span></div>
          <div id="modal-likes-count" class="instagram-modal-stat"><i class="fas fa-heart"></i> <span>0</span></div>
          <div id="modal-date" class="instagram-modal-stat"><i class="fas fa-calendar"></i> <span></span></div>
        </div>

        <!-- وصف المشروع -->
        <div class="instagram-modal-description">
          <h3>عن المشروع</h3>
          <div id="modal-project-description" class="modal-project-description"></div>
        </div>
      </div>
      
      <!-- حقول مخفية لبيانات الفيديو -->
      <input type="hidden" id="modal-has-video" value="0">
      <input type="hidden" id="modal-video-type" value="">
      <input type="hidden" id="modal-video-url" value="">
      <input type="hidden" id="modal-video-file" value="">
    </div>
  `;
  
  // إضافة النافذة للمستند
  document.body.appendChild(modal);
  
  // إضافة مستمعات الأحداث للنافذة
  setupModalEvents();
  
  // تهيئة وظائف الفيديو
  setupVideoFunctions();
  
  modalInitialized = true;
}

/**
 * إضافة مستمعات الأحداث للنافذة المنبثقة
 */
function setupModalEvents() {
  // زر الإغلاق
  const closeButton = document.getElementById('instagram-modal-close');
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }
  
  // إغلاق النافذة عند النقر خارجها
  const modal = document.getElementById('instagram-modal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  
  // زر الإعجاب
  const likeButton = document.getElementById('modal-like-button');
  if (likeButton) {
    likeButton.addEventListener('click', function() {
      toggleLike();
    });
  }
  
  // زر المشاركة
  const shareButton = document.getElementById('modal-share-button');
  if (shareButton) {
    shareButton.addEventListener('click', function(e) {
      e.preventDefault();
      // نسخ رابط المشروع إلى الحافظة
      const url = window.location.origin + '/portfolio/' + currentPortfolioId;
      navigator.clipboard.writeText(url).then(function() {
        // عرض رسالة نجاح النسخ
        showNotification('تم نسخ رابط المشروع بنجاح');
      }, function() {
        // في حالة حدوث خطأ
        showNotification('حدث خطأ أثناء نسخ الرابط', 'error');
      });
    });
  }
  
  // رابط فتح العرض الخارجي
  const externalLink = document.getElementById('modal-external-link');
  if (externalLink) {
    externalLink.addEventListener('click', function() {
      // الرابط معين في بيانات المشروع
      // يعمل النقر على فتح الرابط في نافذة جديدة
    });
  }
}

/**
 * إضافة مستمعات الأحداث لعناصر المعرض
 */
function setupPortfolioItemEvents() {
  // الحصول على جميع عناصر المعرض
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  // إضافة مستمع لكل عنصر
  portfolioItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const portfolioId = this.getAttribute('data-id');
      if (portfolioId) {
        openModal(portfolioId);
      }
    });
  });
}

/**
 * فتح النافذة المنبثقة وتحميل بيانات المشروع
 */
function openModal(portfolioId) {
  currentPortfolioId = portfolioId;
  
  // إظهار النافذة
  const modal = document.getElementById('instagram-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
  }
  
  // تحميل بيانات المشروع
  fetch(`/portfolio/${portfolioId}/details`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // تحديث بيانات النافذة
        document.getElementById('modal-portfolio-image').src = data.item.image_url;
        document.getElementById('modal-project-title').textContent = data.item.title;
        document.getElementById('modal-project-category').textContent = data.item.category || '';
        
        // تحديث الإحصائيات
        const viewsElement = document.querySelector('#modal-views-count span');
        const likesElement = document.querySelector('#modal-likes-count span');
        const dateElement = document.querySelector('#modal-date span');
        
        if (viewsElement) viewsElement.textContent = data.item.views_count || 0;
        if (likesElement) likesElement.textContent = data.item.likes_count || 0;
        if (dateElement) dateElement.textContent = data.item.created_at || '';
        
        // إضافة الوصف
        const descElement = document.getElementById('modal-project-description');
        if (descElement) descElement.innerHTML = data.item.description || '';
        
        // تحديث الرابط الخارجي إذا كان موجود
        const externalLink = document.getElementById('modal-external-link');
        if (externalLink && data.item.external_url) {
          externalLink.href = data.item.external_url;
        } else if (externalLink) {
          externalLink.style.display = 'none';
        }

        // تحديث حالة زر الإعجاب
        updateLikeButton(data.item.user_liked || false);
        
        // تحديث بيانات الفيديو وزر الفيديو
        updateVideoData(data.item);
        
        // تسجيل مشاهدة
        recordView();
      }
    })
    .catch(error => {
      console.error('حدث خطأ في تحميل بيانات المشروع:', error);
    });
}

/**
 * إغلاق النافذة المنبثقة
 */
function closeModal() {
  const modal = document.getElementById('instagram-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // إعادة تمكين التمرير
  }
  currentPortfolioId = null;
}

/**
 * تسجيل مشاهدة للمشروع
 */
function recordView() {
  if (!currentPortfolioId) return;
  
  fetch(`/portfolio/${currentPortfolioId}/view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // تحديث عداد المشاهدات
        const viewsElement = document.querySelector('#modal-views-count span');
        if (viewsElement) viewsElement.textContent = data.views_count || 0;
      }
    })
    .catch(error => {
      console.error('حدث خطأ في تسجيل المشاهدة:', error);
    });
}

/**
 * تبديل حالة الإعجاب
 */
function toggleLike() {
  if (!currentPortfolioId) return;
  
  // عرض مؤشر التحميل قبل إرسال الطلب
  const likeButton = document.getElementById('modal-like-button');
  if (likeButton) {
    const originalHTML = likeButton.innerHTML;
    likeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    likeButton.disabled = true;
  }
  
  fetch(`/portfolio/${currentPortfolioId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // تحديث عدد الإعجابات
        const likesElement = document.querySelector('#modal-likes-count span');
        if (likesElement) likesElement.textContent = data.likes_count || 0;
        
        // تحديث حالة زر الإعجاب
        updateLikeButton(data.liked || false);
        
        // عرض رسالة إشعار للمستخدم
        if (data.liked) {
          // تم إضافة إعجاب وإرسال إشعار عبر تلغرام
          showNotification('تم إضافة إعجابك بنجاح ❤️ وتم إرسال إشعار');
        } else {
          showNotification('تم إزالة إعجابك');
        }
      } else {
        // في حالة الفشل
        showNotification('حدث خطأ أثناء تبديل حالة الإعجاب', 'error');
        // إعادة الزر لحالته الأصلية
        if (likeButton) {
          likeButton.disabled = false;
          updateLikeButton(false);
        }
      }
    })
    .catch(error => {
      console.error('حدث خطأ في تبديل حالة الإعجاب:', error);
      showNotification('حدث خطأ في الاتصال بالخادم', 'error');
      // إعادة الزر لحالته الأصلية
      if (likeButton) {
        likeButton.disabled = false;
        updateLikeButton(false);
      }
    });
}

/**
 * تحديث شكل زر الإعجاب
 */
function updateLikeButton(isLiked) {
  const likeButton = document.getElementById('modal-like-button');
  if (likeButton) {
    if (isLiked) {
      likeButton.innerHTML = '<i class="fas fa-heart" style="color: #e74c3c;"></i> إعجاب';
      likeButton.classList.add('liked');
    } else {
      likeButton.innerHTML = '<i class="far fa-heart"></i> إعجاب';
      likeButton.classList.remove('liked');
    }
  }
}

/**
 * تهيئة وظائف الفيديو
 */
function setupVideoFunctions() {
  // إضافة مستمع حدث لزر الفيديو
  const videoButton = document.getElementById('modal-video-button');
  if (videoButton) {
    videoButton.addEventListener('click', function() {
      displayVideo();
    });
  }
}

/**
 * تحديث بيانات الفيديو وإظهار/إخفاء زر الفيديو
 */
function updateVideoData(item) {
  // تحديث حقول بيانات الفيديو المخفية
  const hasVideoInput = document.getElementById('modal-has-video');
  const videoTypeInput = document.getElementById('modal-video-type');
  const videoUrlInput = document.getElementById('modal-video-url');
  const videoFileInput = document.getElementById('modal-video-file');
  
  if (hasVideoInput && videoTypeInput && videoUrlInput && videoFileInput) {
    // تعيين قيم بيانات الفيديو
    const hasVideo = item.has_video || false;
    hasVideoInput.value = hasVideo ? '1' : '0';
    videoTypeInput.value = item.video_type || '';
    videoUrlInput.value = item.video_url || '';
    videoFileInput.value = item.video_file || '';
    
    console.log('تم تحديث بيانات الفيديو:', {
      hasVideo: hasVideo,
      videoType: item.video_type,
      videoUrl: item.video_url,
      videoFile: item.video_file
    });
    
    // تحديث حالة زر الفيديو
    const videoButton = document.getElementById('modal-video-button');
    if (videoButton) {
      // إظهار أو إخفاء زر الفيديو حسب وجود الفيديو
      videoButton.style.display = hasVideo ? 'inline-flex' : 'none';
      
      // إضافة تأثير نبض للزر لجذب الانتباه
      if (hasVideo) {
        videoButton.classList.add('pulse-animation');
      } else {
        videoButton.classList.remove('pulse-animation');
      }
    }
  }
}

/**
 * عرض الفيديو في النافذة المنبثقة
 */
function displayVideo() {
  console.log('تم النقر على زر الفيديو');
  
  // التحقق من وجود فيديو
  const hasVideoInput = document.getElementById('modal-has-video');
  if (!hasVideoInput || hasVideoInput.value !== '1') {
    console.warn('لا يوجد فيديو لهذا العنصر');
    showNotification('لا يوجد فيديو لهذا العنصر', 'error');
    return;
  }
  
  // الحصول على حاويات الصورة والفيديو
  const imageContainer = document.getElementById('modal-image-container');
  const videoContainer = document.getElementById('modal-video-container');
  
  if (!imageContainer || !videoContainer) {
    console.error('لم يتم العثور على حاويات الصورة/الفيديو');
    return;
  }
  
  // الحصول على نوع ومصدر الفيديو
  const videoTypeInput = document.getElementById('modal-video-type');
  const videoUrlInput = document.getElementById('modal-video-url');
  const videoFileInput = document.getElementById('modal-video-file');
  
  if (!videoTypeInput || !videoUrlInput || !videoFileInput) {
    console.error('لم يتم العثور على حقول بيانات الفيديو');
    return;
  }
  
  const videoType = videoTypeInput.value;
  const videoUrl = videoUrlInput.value;
  const videoFile = videoFileInput.value;
  
  console.log('بيانات الفيديو:', {
    type: videoType,
    url: videoUrl,
    file: videoFile
  });
  
  // إعداد الفيديو حسب نوعه
  if (videoType === 'external') {
    setupExternalVideo(videoUrl);
  } else {
    setupLocalVideo(videoFile);
  }
  
  // إخفاء الصورة وإظهار الفيديو
  imageContainer.style.display = 'none';
  videoContainer.style.display = 'block';
  
  // إضافة زر العودة للصورة إذا لم يكن موجوداً
  addBackToImageButton();
}

/**
 * إعداد الفيديو الخارجي (يوتيوب، فيميو، إلخ)
 */
function setupExternalVideo(videoUrl) {
  console.log('إعداد الفيديو الخارجي:', videoUrl);
  
  // إنشاء حاوية الفيديو الخارجي إذا لم تكن موجودة
  let externalVideoContainer = document.getElementById('modal-external-video-container');
  if (!externalVideoContainer) {
    externalVideoContainer = document.createElement('div');
    externalVideoContainer.id = 'modal-external-video-container';
    externalVideoContainer.style.width = '100%';
    externalVideoContainer.style.height = '100%';
    externalVideoContainer.style.position = 'relative';
    externalVideoContainer.style.paddingBottom = '60px'; // إضافة مساحة لزر العودة
    
    const videoContainer = document.getElementById('modal-video-container');
    if (videoContainer) {
      videoContainer.appendChild(externalVideoContainer);
    }
  }
  
  // إنشاء عنصر الإطار إذا لم يكن موجوداً
  let externalVideo = document.getElementById('modal-external-video');
  if (!externalVideo) {
    externalVideo = document.createElement('iframe');
    externalVideo.id = 'modal-external-video';
    externalVideo.style.width = '100%';
    externalVideo.style.maxHeight = 'calc(100% - 60px)';
    externalVideo.style.border = 'none';
    externalVideo.style.borderRadius = '8px';
    externalVideo.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    externalVideo.setAttribute('allowfullscreen', 'true');
    externalVideo.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    
    externalVideoContainer.appendChild(externalVideo);
  }
  
  // معالجة روابط يوتيوب وفيميو
  let embedUrl = videoUrl;
  
  if (videoUrl.includes('youtube.com/watch?v=')) {
    const videoId = videoUrl.split('watch?v=')[1].split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (videoUrl.includes('vimeo.com/')) {
    const videoId = videoUrl.split('vimeo.com/')[1].split('?')[0];
    embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }
  
  console.log('رابط الفيديو المضمن:', embedUrl);
  
  // تعيين المصدر وإظهار الفيديو
  externalVideo.src = embedUrl;
  externalVideoContainer.style.display = 'block';
  
  // إخفاء حاوية الفيديو المحلي (إذا كانت موجودة)
  const localVideoContainer = document.getElementById('modal-local-video-container');
  if (localVideoContainer) {
    localVideoContainer.style.display = 'none';
  }
  
  // عرض رسالة توضيحية للمستخدم
  showNotification('تم تشغيل الفيديو من المصدر الخارجي، يمكنك العودة للصورة عبر الزر بالأسفل');
}

/**
 * إعداد الفيديو المحلي
 */
function setupLocalVideo(videoFile) {
  console.log('إعداد الفيديو المحلي:', videoFile);
  
  // إنشاء حاوية الفيديو المحلي إذا لم تكن موجودة
  let localVideoContainer = document.getElementById('modal-local-video-container');
  if (!localVideoContainer) {
    localVideoContainer = document.createElement('div');
    localVideoContainer.id = 'modal-local-video-container';
    localVideoContainer.style.width = '100%';
    localVideoContainer.style.height = '100%';
    localVideoContainer.style.position = 'relative';
    localVideoContainer.style.paddingBottom = '60px'; // إضافة مساحة لزر العودة
    
    const videoContainer = document.getElementById('modal-video-container');
    if (videoContainer) {
      videoContainer.appendChild(localVideoContainer);
    }
  }
  
  // إنشاء عنصر الفيديو إذا لم يكن موجوداً
  let videoElement = document.getElementById('modal-local-video');
  let videoSource = document.getElementById('modal-video-source');
  
  if (!videoElement) {
    videoElement = document.createElement('video');
    videoElement.id = 'modal-local-video';
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.style.width = '100%';
    videoElement.style.maxHeight = 'calc(100% - 60px)';
    videoElement.style.borderRadius = '8px';
    videoElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    
    videoSource = document.createElement('source');
    videoSource.id = 'modal-video-source';
    videoSource.type = 'video/mp4';
    
    videoElement.appendChild(videoSource);
    localVideoContainer.appendChild(videoElement);
    
    // إضافة رسالة للمستخدم إذا لم يتم تحميل الفيديو
    videoElement.addEventListener('error', function() {
      showNotification('حدث خطأ أثناء تحميل الفيديو', 'error');
    });
    
    // عرض إشعار عند بدء تشغيل الفيديو
    videoElement.addEventListener('play', function() {
      showNotification('تم تشغيل الفيديو');
    });
  }
  
  // تعيين مصدر الفيديو
  if (videoSource) {
    videoSource.src = videoFile;
    videoElement.load();
  }
  
  // إظهار حاوية الفيديو المحلي
  localVideoContainer.style.display = 'block';
  
  // إخفاء حاوية الفيديو الخارجي (إذا كانت موجودة)
  const externalVideoContainer = document.getElementById('modal-external-video-container');
  if (externalVideoContainer) {
    externalVideoContainer.style.display = 'none';
  }
  
  // عرض رسالة توضيحية للمستخدم
  showNotification('تم تشغيل الفيديو، يمكنك العودة للصورة عبر الزر بالأسفل');
}

/**
 * إضافة زر العودة للصورة
 */
function addBackToImageButton() {
  const videoContainer = document.getElementById('modal-video-container');
  if (!videoContainer) return;
  
  // التحقق من وجود الزر مسبقاً
  if (document.getElementById('back-to-image-button')) return;
  
  // إنشاء حاوية الزر
  const buttonContainer = document.createElement('div');
  buttonContainer.style.position = 'absolute';
  buttonContainer.style.bottom = '20px';
  buttonContainer.style.left = '0';
  buttonContainer.style.right = '0';
  buttonContainer.style.textAlign = 'center';
  buttonContainer.style.zIndex = '1000';
  
  // إنشاء زر العودة للصورة
  const backButton = document.createElement('button');
  backButton.id = 'back-to-image-button';
  backButton.className = 'instagram-modal-action-button';
  backButton.innerHTML = '<i class="fas fa-image"></i> العودة للصورة';
  backButton.style.backgroundColor = 'rgba(79, 70, 229, 0.9)';
  backButton.style.color = 'white';
  backButton.style.padding = '12px 25px';
  backButton.style.fontSize = '16px';
  backButton.style.fontWeight = 'bold';
  backButton.style.borderRadius = '8px';
  backButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  backButton.style.border = 'none';
  backButton.style.cursor = 'pointer';
  
  // إضافة مستمع حدث للزر
  backButton.addEventListener('click', backToImage);
  
  // إضافة الزر إلى الحاوية
  buttonContainer.appendChild(backButton);
  videoContainer.appendChild(buttonContainer);
}

/**
 * العودة لعرض الصورة
 */
function backToImage() {
  console.log('العودة لعرض الصورة');
  
  const imageContainer = document.getElementById('modal-image-container');
  const videoContainer = document.getElementById('modal-video-container');
  
  if (!imageContainer || !videoContainer) {
    console.error('لم يتم العثور على حاويات الصورة/الفيديو');
    return;
  }
  
  // إيقاف تشغيل الفيديو
  const localVideo = document.getElementById('modal-local-video');
  if (localVideo) {
    localVideo.pause();
  }
  
  // إفراغ مصدر الفيديو الخارجي
  const externalVideo = document.getElementById('modal-external-video');
  if (externalVideo) {
    externalVideo.src = '';
  }
  
  // إظهار الصورة وإخفاء الفيديو
  imageContainer.style.display = 'block';
  videoContainer.style.display = 'none';
  
  // إظهار إشعار للمستخدم
  showNotification('تم العودة لعرض صورة المشروع');
  
  // إبراز زر الفيديو مرة أخرى
  const videoButton = document.getElementById('modal-video-button');
  if (videoButton) {
    // التأكد من أن الزر له تأثير نبضي لجذب الانتباه
    videoButton.classList.add('pulse-animation');
    
    // إزالة التأثير النبضي بعد مدة لعدم إزعاج المستخدم
    setTimeout(() => {
      videoButton.classList.remove('pulse-animation');
    }, 5000);
  }
}

/**
 * عرض إشعار للمستخدم
 */
function showNotification(message, type = 'success') {
  // إضافة نمط التأثير النبضي للزر إذا لم يكن موجودًا
  if (!document.getElementById('pulse-animation-style')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'pulse-animation-style';
    styleElement.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
        }
      }
      
      .pulse-animation {
        animation: pulse 2s infinite;
        box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
        background: linear-gradient(to right, #4f46e5, #7c3aed) !important;
        border-color: transparent !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // التحقق من وجود حاوية الإشعارات، وإنشاؤها إذا لم تكن موجودة
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '10000';
    document.body.appendChild(container);
  }

  // إنشاء عنصر الإشعار
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.backgroundColor = type === 'success' ? 'rgba(79, 70, 229, 0.9)' : 'rgba(220, 38, 38, 0.9)';
  notification.style.color = 'white';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  notification.style.marginBottom = '10px';
  notification.style.minWidth = '250px';
  notification.style.backdropFilter = 'blur(8px)';
  notification.style.border = '1px solid ' + (type === 'success' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 99, 71, 0.4)');
  notification.style.transform = 'translateX(100%)';
  notification.style.opacity = '0';
  notification.style.transition = 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)';

  // إضافة الرمز والرسالة
  const icon = type === 'success' ? '<i class="fas fa-check-circle" style="margin-left: 10px;"></i>' : '<i class="fas fa-exclamation-circle" style="margin-left: 10px;"></i>';
  notification.innerHTML = `${icon} ${message}`;

  // إضافة الإشعار إلى الحاوية
  container.appendChild(notification);

  // ظهور الإشعار بتأثير حركي
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 50);

  // إخفاء الإشعار بعد فترة
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    
    // إزالة الإشعار من DOM بعد انتهاء التأثير
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

