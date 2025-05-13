/**
 * إصلاح النوافذ المنبثقة لمعرض الأعمال
 * هذا الملف يعيد تعريف وظائف التفاعل مع النوافذ المنبثقة بحيث تتوافق مع المسارات الحالية
 */

// إعلان عالمي للمسارات المتاحة
const API_PATHS = {
    DETAILS: ['/portfolio/:id/detail', '/instagram/api/portfolio/:id/details'],
    VIEW: ['/portfolio/:id/view', '/instagram/api/portfolio/:id/view'],
    LIKE: ['/portfolio/:id/like', '/instagram/api/portfolio/:id/like']
};

// تسجيل بداية تحميل الملف
console.log("جاري تهيئة إصلاح النوافذ المنبثقة للمشاريع...");

// الوظيفة الرئيسية لفتح النافذة المنبثقة
function openPortfolioModal(itemId) {
    console.log("فتح النافذة المنبثقة للمشروع رقم:", itemId);
    
    // استخدام المسار الجديد المضبوط
    let apiUrl = `/portfolio/${itemId}/details`;
    
    // محاولة فتح التفاصيل
    fetch(apiUrl)
        .then(response => {
            if (!response.ok && response.status === 404) {
                // إذا لم يتم العثور على المسار الجديد، جرب المسارات البديلة
                console.log("جاري تجربة المسارات البديلة...");
                return fetch(`/portfolio/${itemId}/detail`).then(resp => {
                    if (!resp.ok && resp.status === 404) {
                        return fetch(`/instagram/api/portfolio/${itemId}/details`);
                    }
                    return resp;
                });
            }
            return response;
        })
        .then(response => response.json())
        .then(data => {
            // فتح النافذة المنبثقة وتعبئة البيانات
            updateModalContent(data);
            recordView(itemId);
        })
        .catch(error => {
            console.error('خطأ في تحميل تفاصيل المشروع:', error);
        });
}

// تحديث محتوى النافذة المنبثقة
function updateModalContent(data) {
    // التعامل مع الاستجابة حسب التنسيق
    let item = data.item || data;
    
    // فتح النافذة المنبثقة
    let modal = document.getElementById('portfolio-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // تعيين البيانات
        let modalImage = document.getElementById('modal-image');
        if (modalImage) modalImage.src = item.image_url;
        
        let modalTitle = document.getElementById('modal-title');
        if (modalTitle) modalTitle.textContent = item.title;
        
        let modalCategory = document.getElementById('modal-category');
        if (modalCategory) modalCategory.textContent = item.category;
        
        let modalDescription = document.getElementById('modal-description');
        if (modalDescription) modalDescription.innerHTML = item.description;
        
        // تعيين أزرار التفاعل
        let likeButton = document.getElementById('like-button');
        if (likeButton) {
            likeButton.dataset.id = item.id;
            likeButton.classList.toggle('liked', item.user_liked);
        }
        
        // التعامل مع الفيديو إذا كان متاحاً
        const hasVideo = item.has_video === true || (item.video_type && (item.video_url || item.video_file));
        console.log('معلومات الفيديو:', {
            has_video: item.has_video,
            video_type: item.video_type,
            video_url: item.video_url,
            video_file: item.video_file,
            hasVideo: hasVideo
        });
        
        // تعيين بيانات الفيديو للاستخدام مع modal-video.js
        let modalHasVideo = document.getElementById('modal-has-video');
        if (modalHasVideo) {
            modalHasVideo.value = hasVideo ? '1' : '0';
            console.log('تم تعيين قيمة modal-has-video:', modalHasVideo.value);
        }
        
        let modalVideoType = document.getElementById('modal-video-type');
        if (modalVideoType) modalVideoType.value = item.video_type || '';
        
        let modalVideoUrl = document.getElementById('modal-video-url');
        if (modalVideoUrl) modalVideoUrl.value = item.video_url || '';
        
        let modalVideoFile = document.getElementById('modal-video-file');
        if (modalVideoFile) modalVideoFile.value = item.video_file || '';
        
        // للتجربة: إجبار الفيديو على الظهور
        if (modalHasVideo) modalHasVideo.value = '1';
        if (modalVideoType) modalVideoType.value = modalVideoType.value || 'external';
        if (modalVideoUrl && !modalVideoUrl.value) modalVideoUrl.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        
        // إظهار أو إخفاء زر الفيديو بناءً على وجود فيديو
        let videoButtonContainer = document.getElementById('modal-video-button-container');
        if (videoButtonContainer) {
            videoButtonContainer.style.display = 'block'; // إظهار دائم للتجربة
            console.log('تم تعيين حالة video-button-container:', videoButtonContainer.style.display);
        }
        
        // إظهار زر الفيديو المنفصل
        let videoActionBtn = document.getElementById('video-action-btn');
        if (videoActionBtn) {
            console.log('تعيين حالة زر الفيديو المنفصل - hasVideo:', hasVideo);
            videoActionBtn.style.display = 'block'; // إظهار دائم للتجربة
            
            // إعادة تعيين أي مستمعات أحداث سابقة
            const actionButton = videoActionBtn.querySelector('button');
            if (actionButton) {
                const newButton = actionButton.cloneNode(true);
                actionButton.parentNode.replaceChild(newButton, actionButton);
                
                newButton.addEventListener('click', function() {
                    console.log('تم النقر على زر مشاهدة الفيديو المنفصل');
                    if (typeof window.showVideo === 'function') {
                        window.showVideo();
                    } else {
                        // استدعاء مباشر
                        const imageContainer = document.getElementById('modal-image-container');
                        const videoContainer = document.getElementById('modal-video-container');
                        if (imageContainer && videoContainer) {
                            imageContainer.style.display = 'none';
                            videoContainer.style.display = 'block';
                        }
                    }
                });
            }
        }
        
        // تهيئة زر الفيديو الرئيسي
        let mainVideoBtn = document.getElementById('show-video-btn');
        if (mainVideoBtn) {
            mainVideoBtn.onclick = function() {
                console.log('تم النقر على زر الفيديو الرئيسي');
                if (typeof window.showVideo === 'function') {
                    window.showVideo();
                } else {
                    // استدعاء مباشر
                    const imageContainer = document.getElementById('modal-image-container');
                    const videoContainer = document.getElementById('modal-video-container');
                    if (imageContainer && videoContainer) {
                        imageContainer.style.display = 'none';
                        videoContainer.style.display = 'block';
                    }
                }
            };
        }
        
        // إضافة زر الفيديو في شريط الأزرار إذا لم يكن موجوداً
        let actionsContainer = document.querySelector('.modal-actions');
        let existingButton = document.getElementById('show-video-btn-inline');
        
        if (actionsContainer && !existingButton) {
            // إنشاء زر جديد
            let videoButton = document.createElement('button');
            videoButton.id = 'show-video-btn-inline';
            videoButton.type = 'button';
            videoButton.innerHTML = '<i class="fas fa-play-circle"></i>';
            videoButton.style.backgroundColor = '#28a745';
            videoButton.style.color = 'white';
            videoButton.style.border = 'none';
            videoButton.style.borderRadius = '4px';
            videoButton.style.margin = '0 5px';
            videoButton.style.padding = '8px 12px';
            videoButton.style.display = hasVideo ? 'inline-block' : 'none';
            
            // إضافة تأثير التوهج
            videoButton.style.animation = 'glow 1.5s infinite alternate';
            
            // إضافة حدث النقر
            videoButton.addEventListener('click', function() {
                console.log('تم النقر على زر الفيديو في شريط الأزرار');
                if (typeof showPortfolioVideo === 'function') {
                    showPortfolioVideo();
                } else if (typeof showVideo === 'function') {
                    showVideo();
                } else {
                    alert('جاري تحميل وظائف الفيديو...');
                }
            });
            
            // إضافة الزر قبل آخر زر في الحاوية
            actionsContainer.insertBefore(videoButton, actionsContainer.lastElementChild);
        } else if (existingButton) {
            // تحديث حالة الزر الموجود
            existingButton.style.display = hasVideo ? 'inline-block' : 'none';
        }

        // إذا كانت هناك دالة عالمية لتعيين البيانات في النافذة المنبثقة، استخدمها
        if (typeof window.setModalData === 'function') {
            window.setModalData(item);
        }
    }
}

// تسجيل مشاهدة المشروع
function recordView(itemId) {
    // إعادة توجيه مسار API لتوافق إما المسار الجديد أو القديم
    let apiUrl = `/instagram/api/portfolio/${itemId}/view`;
    
    // محاولة تسجيل المشاهدة باستخدام المسار الجديد
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok && response.status === 404) {
            // إذا لم يتم العثور على المسار الجديد، جرب المسار القديم
            return fetch(`/portfolio/${itemId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        }
        return response;
    })
    .then(response => response.json())
    .then(data => {
        console.log('تم تسجيل المشاهدة بنجاح');
        
        // تحديث عداد المشاهدات في الصفحة إذا كان موجودًا
        let viewsCounter = document.querySelector(`[data-views-id="${itemId}"]`);
        if (viewsCounter && data.views_count) {
            viewsCounter.textContent = data.views_count;
        }
    })
    .catch(error => {
        console.error('خطأ في تسجيل المشاهدة:', error);
    });
}

// تبديل حالة الإعجاب
function toggleLike(itemId) {
    // إعادة توجيه مسار API لتوافق إما المسار الجديد أو القديم
    let apiUrl = `/instagram/api/portfolio/${itemId}/like`;
    
    // محاولة تبديل الإعجاب باستخدام المسار الجديد
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok && response.status === 404) {
            // إذا لم يتم العثور على المسار الجديد، جرب المسار القديم
            return fetch(`/portfolio/${itemId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        }
        return response;
    })
    .then(response => response.json())
    .then(data => {
        console.log('تم تبديل حالة الإعجاب بنجاح');
        
        // تحديث زر الإعجاب
        let likeButton = document.querySelector(`[data-like-id="${itemId}"]`);
        if (likeButton) {
            likeButton.classList.toggle('liked', data.liked);
        }
        
        // تحديث عداد الإعجابات في الصفحة
        let likesCounter = document.querySelector(`[data-likes-id="${itemId}"]`);
        if (likesCounter && data.likes_count !== undefined) {
            likesCounter.textContent = data.likes_count;
        }
    })
    .catch(error => {
        console.error('خطأ في تبديل حالة الإعجاب:', error);
    });
}

// إغلاق النافذة المنبثقة
function closeModal() {
    let modal = document.getElementById('portfolio-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// إضافة مستمعي الأحداث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // مستمع لإغلاق النافذة المنبثقة
    let closeButton = document.getElementById('close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    // مستمع للنقر خارج النافذة المنبثقة
    window.addEventListener('click', function(event) {
        let modal = document.getElementById('portfolio-modal');
        if (modal && event.target === modal) {
            closeModal();
        }
    });
    
    // مستمع لأزرار الإعجاب
    document.querySelectorAll('[data-like-id]').forEach(button => {
        button.addEventListener('click', function() {
            toggleLike(this.dataset.likeId);
        });
    });
    
    // إعادة تعريف وظيفة فتح النافذة المنبثقة للصفحة بأكملها
    window.openPortfolioModal = openPortfolioModal;
    
    console.log('تم تهيئة إصلاح النوافذ المنبثقة لمعرض الأعمال');
});

// إصلاح الروابط الحالية في الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إصلاح روابط المشاريع
    document.querySelectorAll('[data-portfolio-id]').forEach(element => {
        element.addEventListener('click', function(event) {
            event.preventDefault();
            openPortfolioModal(this.dataset.portfolioId);
        });
    });
    
    // إضافة التأثير الحركي للتوهج
    const style = document.createElement('style');
    style.textContent = `
        @keyframes glow {
            from {
                box-shadow: 0 0 5px rgba(40, 167, 69, 0.5);
            }
            to {
                box-shadow: 0 0 15px rgba(40, 167, 69, 0.8);
            }
        }
    `;
    document.head.appendChild(style);
});
