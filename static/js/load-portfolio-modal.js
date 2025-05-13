/**
 * تحميل مكونات النافذة المنبثقة ديناميكياً
 * هذا الملف يتحقق من وجود النافذة المنبثقة ويقوم بإضافتها إذا لم تكن موجودة
 */

document.addEventListener('DOMContentLoaded', function() {
  // التحقق من وجود النافذة المنبثقة
  if (!document.getElementById('portfolio-modal')) {
    console.log('إضافة النافذة المنبثقة للمشاريع ديناميكياً');
    
    // الحصول على قالب النافذة المنبثقة من API
    fetch('/portfolio/modal_templates')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // إضافة النافذة المنبثقة إلى نهاية الصفحة
          document.body.insertAdjacentHTML('beforeend', data.html);
          console.log('تم إضافة النافذة المنبثقة من الخادم بنجاح');
        } else {
          // في حالة فشل الحصول على القالب من الخادم، استخدم النسخة المضمنة
          const modalHTML = `
            <div id="portfolio-modal" class="portfolio-modal">
              <button id="close-modal" class="close-modal">&times;</button>
              
              <div class="modal-container">
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
                    
                    <div class="modal-meta">
                      <span id="modal-date"></span>
                    </div>
                  </div>
                  
                  <div class="modal-actions">
                    <button id="like-button" type="button"><i class="far fa-heart"></i></button>
                    <button id="show-video-btn-inline" class="video-btn-inline" onclick="showVideo()" style="display: none;">
                      <i class="fas fa-play-circle"></i> عرض الفيديو
                    </button>
                    <button type="button"><i class="far fa-share-square"></i></button>
                  </div>
                  
                  <!-- زر عرض الفيديو منفصل (يظهر فقط عند وجود فيديو) -->
                  <div id="video-action-btn" class="video-action-container" style="display: none;">
                    <button onclick="showVideo()" class="video-action-button">
                      <i class="fas fa-play-circle"></i> مشاهدة الفيديو
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
          console.log('تم إضافة النافذة المنبثقة المضمنة بنجاح');
        }
        
        // إضافة مستمعات الأحداث بعد إضافة النافذة المنبثقة
        setupModalEventListeners();
      })
      .catch(error => {
        console.error('خطأ في الحصول على قالب النافذة المنبثقة:', error);
        
        // في حالة حدوث خطأ، استخدم النسخة المضمنة
        const modalHTML = `
          <div id="portfolio-modal" class="portfolio-modal">
            <button id="close-modal" class="close-modal">&times;</button>
            <div class="modal-container">
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
                  
                  <div class="modal-meta">
                    <span id="modal-date"></span>
                  </div>
                </div>
                <div class="modal-actions">
                  <button id="like-button" type="button"><i class="far fa-heart"></i></button>
                  <button id="show-video-btn-inline" class="video-btn-inline" onclick="showVideo()" style="display: none;">
                    <i class="fas fa-play-circle"></i> عرض الفيديو
                  </button>
                  <button type="button"><i class="far fa-share-square"></i></button>
                </div>
                
                <!-- زر عرض الفيديو منفصل (يظهر فقط عند وجود فيديو) -->
                <div id="video-action-btn" class="video-action-container" style="display: none;">
                  <button onclick="showVideo()" class="video-action-button">
                    <i class="fas fa-play-circle"></i> مشاهدة الفيديو
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
        console.log('تم إضافة النافذة المنبثقة المضمنة بديلة بنجاح');
        
        // إضافة مستمعات الأحداث بعد إضافة النافذة المنبثقة
        setupModalEventListeners();
      });
  } else {
    console.log('النافذة المنبثقة موجودة بالفعل');
    // إضافة مستمعات الأحداث للنافذة المنبثقة الموجودة
    setupModalEventListeners();
  }
  
  // إضافة مستمعات الأحداث الخاصة بعناصر المشاريع
  document.querySelectorAll('.portfolio-item').forEach(item => {
    // حفظ معرف المشروع
    const itemId = item.getAttribute('data-id');
    if (!itemId) return;
    
    // إضافة خاصية dataset-portfolio-id لتسهيل الوصول
    item.setAttribute('data-portfolio-id', itemId);
    
    // إضافة مستمع النقر
    item.addEventListener('click', function(event) {
      event.preventDefault();
      console.log('تم النقر على مشروع رقم:', itemId);
      
      // استدعاء وظيفة فتح النافذة المنبثقة
      if (typeof openPortfolioModal === 'function') {
        openPortfolioModal(itemId);
      } else {
        console.error('وظيفة فتح النافذة المنبثقة غير متوفرة');
      }
    });
  });
  
  console.log('تم تهيئة مستمعات الأحداث للمشاريع');

  // تحميل ملف JavaScript الخاص بإصلاح النافذة المنبثقة إذا لم يكن محملاً بالفعل
  if (!window.portfolioModalFixLoaded) {
    const script = document.createElement('script');
    script.src = '/static/js/portfolio-modal-fix.js';
    script.onload = function() {
      console.log('تم تحميل ملف إصلاح النافذة المنبثقة بنجاح');
      window.portfolioModalFixLoaded = true;
    };
    document.body.appendChild(script);
  }
});