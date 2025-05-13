/**
 * إصلاح مباشر للنوافذ المنبثقة في معرض الأعمال
 * ملف بسيط يُضاف مباشرة إلى صفحة المعرض
 */

// التأكد من عدم تحميل الملف مرتين
if (typeof window.portfolioModalDirectFixLoaded === 'undefined') {
  window.portfolioModalDirectFixLoaded = true;
  
  console.log('تهيئة الإصلاح المباشر للنوافذ المنبثقة');
  
  // تنفيذ كود الإصلاح عند اكتمال تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    // إضافة مستمعات الأحداث لعناصر المعرض
    fixPortfolioItemsClickEvent();
  });
  
  // إصلاح أحداث النقر على عناصر المعرض
  function fixPortfolioItemsClickEvent() {
    // الحصول على جميع عناصر المعرض
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    console.log('عدد عناصر المعرض:', portfolioItems.length);
    
    // إضافة مستمع حدث النقر لكل عنصر
    portfolioItems.forEach(function(item) {
      // الحصول على معرف المشروع
      const itemId = item.getAttribute('data-id');
      if (!itemId) return;
      
      // استبدال العنصر لإزالة أي مستمعات أحداث موجودة
      const newItem = item.cloneNode(true);
      item.parentNode.replaceChild(newItem, item);
      
      // إضافة مستمع حدث النقر الجديد
      newItem.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('تم النقر على المشروع رقم:', itemId);
        
        // استدعاء وظيفة عرض النافذة المنبثقة
        fetch(`/portfolio/${itemId}/detail`)
          .then(response => response.json())
          .then(data => {
            // إنشاء النافذة المنبثقة إذا لم تكن موجودة
            ensureModalExists();
            
            // عرض البيانات
            showPortfolioModal(data);
            
            // تسجيل المشاهدة
            recordViewCount(itemId);
          })
          .catch(error => {
            console.error('خطأ في جلب بيانات المشروع:', error);
          });
      });
    });
    
    console.log('تم إصلاح أحداث النقر لعناصر المعرض');
  }
  
  // التأكد من وجود النافذة المنبثقة
  function ensureModalExists() {
    if (document.getElementById('portfolio-modal')) {
      return; // النافذة المنبثقة موجودة بالفعل
    }
    
    console.log('إنشاء النافذة المنبثقة');
    
    // إنشاء النافذة المنبثقة مع دعم الفيديو
    const modalHTML = `
      <div id="portfolio-modal" class="portfolio-modal">
        <button id="close-modal" class="close-modal">&times;</button>
        
        <div class="modal-container animate__animated animate__zoomIn animate__faster">
          <!-- قسم الصورة أو الفيديو -->
          <div class="modal-media">
            <!-- صورة المشروع (تظهر افتراضياً) -->
            <div id="modal-image-container" class="modal-image">
              <img id="modal-image" src="" alt="صورة المشروع">
            </div>
            
            <!-- فيديو المشروع (يظهر إذا كان متاحاً) -->
            <div id="modal-video-container" class="modal-video" style="display: none;">
              <!-- فيديو محلي -->
              <div id="modal-local-video-container" style="display: none;">
                <video id="modal-local-video" controls class="w-100">
                  <source id="modal-video-source" src="" type="video/mp4">
                  لا يدعم متصفحك تشغيل الفيديو.
                </video>
              </div>
              
              <!-- فيديو خارجي (يوتيوب/فيميو) -->
              <div id="modal-external-video-container" style="display: none;">
                <iframe id="modal-external-video" frameborder="0" allowfullscreen class="w-100"></iframe>
              </div>
              
              <!-- زر الرجوع إلى الصورة -->
              <div class="text-center mt-2">
                <button id="back-to-image-btn" class="btn btn-light back-to-image-btn">
                  <i class="fas fa-image me-1"></i> العودة للصورة
                </button>
              </div>
            </div>
          </div>
          
          <div class="modal-content">
            <div class="modal-header">
              <img src="/static/uploads/profile.png" alt="صورة الملف الشخصي">
              <h4>فيراس ديزاين</h4>
            </div>
            
            <div class="modal-details">
              <h3 id="modal-title"></h3>
              <span id="modal-category" class="modal-category"></span>
              <div id="modal-description"></div>
              <div id="modal-link-container" style="display: none;">
                <a id="modal-link" href="#" target="_blank" class="btn btn-primary mt-2">زيارة المشروع</a>
              </div>
              
              <!-- زر عرض الفيديو (يظهر فقط إذا كان هناك فيديو) -->
              <div id="modal-video-button-container" style="display: none;" class="mt-3 modal-video-section">
                <button id="show-video-btn" class="btn btn-success btn-lg" onclick="showVideo()">
                  <i class="fas fa-play-circle me-2"></i> عرض فيديو المشروع
                </button>
              </div>
            </div>
            
            <div class="modal-actions">
              <button id="like-button" data-id="" type="button">
                <i class="far fa-heart"></i>
              </button>
              <button id="show-video-btn-inline" class="video-btn-inline" onclick="showVideo()">
                <i class="fas fa-play-circle"></i> عرض الفيديو
              </button>
              <button type="button">
                <i class="far fa-share-square"></i>
              </button>
            </div>
            
            <div class="modal-stats">
              <p id="modal-likes">0 إعجاب</p>
              <p id="modal-views">0 مشاهدة</p>
            </div>
            
            <input type="hidden" id="modal-item-id" value="">
            <!-- حقول مخفية لتخزين بيانات الفيديو -->
            <input type="hidden" id="modal-has-video" value="0">
            <input type="hidden" id="modal-video-type" value="">
            <input type="hidden" id="modal-video-url" value="">
            <input type="hidden" id="modal-video-file" value="">
          </div>
        </div>
      </div>
    `;
    
    // إضافة النافذة المنبثقة إلى نهاية الصفحة
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // إضافة CSS للزر
    if (!document.getElementById('portfolio-modal-video-button-style')) {
      const buttonStyle = document.createElement('style');
      buttonStyle.id = 'portfolio-modal-video-button-style';
      buttonStyle.textContent = `
        .video-btn-inline {
          background-color: #28a745 !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          margin: 0 10px !important;
          padding: 8px 15px !important;
          transition: all 0.3s ease !important;
          animation: pulse 2s infinite !important;
          font-weight: bold !important;
          font-size: 14px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 5px !important;
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3) !important;
        }
        
        .video-btn-inline i {
          font-size: 18px !important;
        }
        
        .video-btn-inline:hover {
          transform: translateY(-2px) !important;
          background-color: #218838 !important;
          box-shadow: 0 6px 12px rgba(40, 167, 69, 0.5) !important;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
          }
        }
      `;
      document.head.appendChild(buttonStyle);
    }
    
    // إضافة مستمعات الأحداث للنافذة المنبثقة
    
    // إغلاق النافذة المنبثقة
    document.getElementById('close-modal').addEventListener('click', function() {
      document.getElementById('portfolio-modal').style.display = 'none';
      document.body.style.overflow = '';
    });
    
    // النقر خارج النافذة المنبثقة لإغلاقها
    document.getElementById('portfolio-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
    
    // تبديل حالة الإعجاب
    document.getElementById('like-button').addEventListener('click', function() {
      const itemId = this.getAttribute('data-id');
      if (!itemId) return;
      
      toggleLike(itemId);
    });
    
    // إضافة مستمع حدث لزر عرض الفيديو
    const showVideoBtn = document.getElementById('show-video-btn');
    if (showVideoBtn) {
      showVideoBtn.addEventListener('click', showVideo);
    }
    
    // إضافة مستمع حدث لزر عرض الفيديو في شريط الأزرار
    const showVideoBtnInline = document.getElementById('show-video-btn-inline');
    if (showVideoBtnInline) {
      showVideoBtnInline.addEventListener('click', showVideo);
    }
    
    // إضافة مستمع حدث لزر العودة للصورة
    const backToImageBtn = document.getElementById('back-to-image-btn');
    if (backToImageBtn) {
      backToImageBtn.addEventListener('click', hideVideo);
    }
    
    console.log('تم إنشاء النافذة المنبثقة بنجاح');
  }
  
  // عرض النافذة المنبثقة مع البيانات
  function showPortfolioModal(data) {
    console.log('عرض بيانات المشروع في النافذة المنبثقة:', data);
    
    // تعيين البيانات
    document.getElementById('modal-image').src = data.image_url;
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-category').textContent = data.category;
    document.getElementById('modal-description').innerHTML = data.description;
    
    // تعيين معرف المشروع لزر الإعجاب
    document.getElementById('like-button').setAttribute('data-id', data.id);
    
    // تعيين حالة الإعجاب
    const likeButton = document.getElementById('like-button');
    if (data.user_liked) {
      likeButton.querySelector('i').className = 'fas fa-heart';
      likeButton.querySelector('i').style.color = '#ef4444';
    } else {
      likeButton.querySelector('i').className = 'far fa-heart';
      likeButton.querySelector('i').style.color = '';
    }
    
    // تعيين عدد الإعجابات والمشاهدات
    document.getElementById('modal-likes').textContent = `${data.likes_count || 0} إعجاب`;
    document.getElementById('modal-views').textContent = `${data.views_count || 0} مشاهدة`;
    
    // تعيين رابط المشروع إذا كان موجودًا
    const linkContainer = document.getElementById('modal-link-container');
    if (data.link) {
      linkContainer.style.display = 'block';
      document.getElementById('modal-link').href = data.link;
    } else {
      linkContainer.style.display = 'none';
    }
    
    // التعامل مع بيانات الفيديو
    const hasVideoInput = document.getElementById('modal-has-video');
    const videoTypeInput = document.getElementById('modal-video-type');
    const videoUrlInput = document.getElementById('modal-video-url');
    const videoFileInput = document.getElementById('modal-video-file');
    
    if (hasVideoInput && videoTypeInput && videoUrlInput && videoFileInput) {
      // تعيين قيم بيانات الفيديو
      hasVideoInput.value = data.has_video ? '1' : '0';
      videoTypeInput.value = data.video_type || '';
      videoUrlInput.value = data.video_url || '';
      videoFileInput.value = data.video_file || '';
      
      console.log('تم تعيين بيانات الفيديو:', { 
        hasVideo: hasVideoInput.value, 
        videoType: videoTypeInput.value 
      });
      
      // تحديث أزرار الفيديو
      if (typeof updateVideoButtons === 'function') {
        updateVideoButtons(data.has_video);
      } else {
        // تحديث الأزرار يدوياً إذا لم تكن الدالة متاحة
        const showVideoBtn = document.getElementById('show-video-btn-inline');
        if (showVideoBtn) {
          showVideoBtn.style.display = data.has_video ? 'inline-flex' : 'none';
        }
      }
    } else {
      console.warn('لم يتم العثور على حقول بيانات الفيديو');
    }
    
    // عرض النافذة المنبثقة
    const modal = document.getElementById('portfolio-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('تم عرض النافذة المنبثقة بنجاح');
  }
  
  // تسجيل مشاهدة للمشروع
  function recordViewCount(itemId) {
    console.log('تسجيل مشاهدة للمشروع رقم:', itemId);
    
    fetch(`/portfolio/${itemId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('تم تسجيل المشاهدة بنجاح:', data);
      
      // تحديث عداد المشاهدات في النافذة المنبثقة
      document.getElementById('modal-views').textContent = `${data.views_count || 0} مشاهدة`;
    })
    .catch(error => {
      console.error('خطأ في تسجيل المشاهدة:', error);
    });
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
  
  // تبديل حالة الإعجاب بالمشروع
  function toggleLike(itemId) {
    console.log('تبديل حالة الإعجاب للمشروع رقم:', itemId);
    
    fetch(`/portfolio/${itemId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('تم تبديل حالة الإعجاب بنجاح:', data);
      
      // تحديث زر الإعجاب
      const likeButton = document.getElementById('like-button');
      const icon = likeButton.querySelector('i');
      
      if (data.liked) {
        icon.className = 'fas fa-heart';
        icon.style.color = '#ef4444';
        icon.classList.add('heart-anim');
        setTimeout(() => icon.classList.remove('heart-anim'), 600);
      } else {
        icon.className = 'far fa-heart';
        icon.style.color = '';
      }
      
      // تحديث عداد الإعجابات في النافذة المنبثقة
      document.getElementById('modal-likes').textContent = `${data.likes_count || 0} إعجاب`;
      
      // تحديث عداد الإعجابات في الصفحة
      const portfolioItem = document.querySelector(`.portfolio-item[data-id="${itemId}"]`);
      if (portfolioItem) {
        const likesCounter = portfolioItem.querySelector('.fa-heart + span');
        if (likesCounter) {
          likesCounter.textContent = data.likes_count || 0;
        }
      }
    })
    .catch(error => {
      console.error('خطأ في تبديل حالة الإعجاب:', error);
    });
  }
  
  // تصدير دوال الفيديو للاستخدام العالمي
  window.showVideo = showVideo;
  window.hideVideo = hideVideo;
}