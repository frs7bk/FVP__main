/**
 * مدير إيقاف تشغيل فيديوهات معرض الأعمال
 * إصدار خاص لحل مشكلة عدم إيقاف الفيديو عند إغلاق النافذة المنبثقة
 * تاريخ: 2025-05-09
 */

(function() {
    // سجل للتأكد من تحميل الملف
    console.log('تم تحميل مدير إيقاف تشغيل الفيديو - v1.0.0 (2025-05-09)');

    // ======================================================
    // الدوال الرئيسية لإيقاف تشغيل الفيديو
    // ======================================================
    
    // إيقاف جميع الفيديوهات المحلية (HTML5 Video)
    function stopAllLocalVideos() {
        console.log('إيقاف جميع الفيديوهات المحلية...');
        
        // العثور على جميع عناصر الفيديو في الصفحة
        const videos = document.querySelectorAll('video');
        
        // إيقاف كل فيديو
        videos.forEach(function(video) {
            try {
                // التحقق من أن الفيديو قيد التشغيل قبل محاولة إيقافه
                if (video && !video.paused) {
                    video.pause();
                    video.currentTime = 0; // إعادة الفيديو للبداية
                    console.log('تم إيقاف فيديو محلي بنجاح');
                }
            } catch (err) {
                console.error('خطأ في إيقاف الفيديو المحلي:', err);
            }
        });
    }
    
    // إيقاف جميع الفيديوهات المضمنة (يوتيوب، فيميو...)
    function stopAllEmbeddedVideos() {
        console.log('إيقاف جميع الفيديوهات المضمنة...');
        
        // العثور على جميع عناصر iframe التي قد تحتوي على فيديو
        const iframes = document.querySelectorAll('iframe');
        
        // إيقاف كل فيديو مضمن عن طريق إزالة المصدر وإعادته
        iframes.forEach(function(iframe) {
            try {
                if (iframe && iframe.src && (
                    iframe.src.includes('youtube.com') || 
                    iframe.src.includes('vimeo.com') || 
                    iframe.id === 'modal-external-video'
                )) {
                    const currentSrc = iframe.src;
                    iframe.src = '';
                    console.log('تم إيقاف فيديو مضمن بنجاح:', currentSrc);
                }
            } catch (err) {
                console.error('خطأ في إيقاف الفيديو المضمن:', err);
            }
        });
    }
    
    // إيقاف جميع الفيديوهات
    function stopAllVideos() {
        console.log('إيقاف جميع الفيديوهات...');
        stopAllLocalVideos();
        stopAllEmbeddedVideos();
        
        // إخفاء حاويات الفيديو (اختياري - يمكن إلغاء التعليق إذا كان ضروريًا)
        try {
            const videoContainer = document.getElementById('modal-video-container');
            if (videoContainer) {
                videoContainer.style.display = 'none';
            }
            
            const localVideoContainer = document.getElementById('modal-local-video-container');
            if (localVideoContainer) {
                localVideoContainer.style.display = 'none';
            }
            
            const externalVideoContainer = document.getElementById('modal-external-video-container');
            if (externalVideoContainer) {
                externalVideoContainer.style.display = 'none';
            }
            
            // إظهار حاوية الصورة
            const imageContainer = document.getElementById('modal-image-container');
            if (imageContainer) {
                imageContainer.style.display = 'block';
            }
        } catch (err) {
            console.error('خطأ في إخفاء حاويات الفيديو:', err);
        }
    }
    
    // ======================================================
    // دوال معالجة أحداث النافذة المنبثقة
    // ======================================================
    
    // معالجة النقر على زر الإغلاق
    function handleCloseButtonClick() {
        console.log('تم النقر على زر الإغلاق - إيقاف جميع الفيديوهات');
        stopAllVideos();
    }
    
    // معالجة النقر على خلفية النافذة المنبثقة (خارج المحتوى)
    function handleBackdropClick(event) {
        // التأكد من أن النقر تم على الخلفية وليس على محتوى النافذة
        if (event.target === document.getElementById('portfolio-modal')) {
            console.log('تم النقر خارج محتوى النافذة المنبثقة - إيقاف جميع الفيديوهات');
            stopAllVideos();
        }
    }
    
    // معالجة الضغط على مفتاح ESC
    function handleEscKeyPress(event) {
        if (event.key === 'Escape' || event.keyCode === 27) {
            console.log('تم الضغط على مفتاح ESC - إيقاف جميع الفيديوهات');
            stopAllVideos();
        }
    }
    
    // معالجة النقر على عنصر مشروع آخر (للتنقل بين المشاريع)
    function handlePortfolioItemClick() {
        console.log('تم النقر على عنصر مشروع - إيقاف جميع الفيديوهات قبل تحميل المشروع الجديد');
        stopAllVideos();
    }
    
    // ======================================================
    // إعداد مستمعي الأحداث
    // ======================================================
    
    function setupEventListeners() {
        console.log('إعداد مستمعي أحداث لإيقاف تشغيل الفيديو عند إغلاق النافذة المنبثقة');
        
        try {
            // 1. إضافة مستمع لزر الإغلاق
            const closeButton = document.getElementById('close-modal');
            if (closeButton) {
                closeButton.addEventListener('click', handleCloseButtonClick);
                console.log('تم إعداد مستمع لزر الإغلاق');
            } else {
                console.warn('لم يتم العثور على زر الإغلاق #close-modal');
                
                // محاولة بديلة للعثور على زر الإغلاق
                const alternativeCloseButtons = document.querySelectorAll('.close-modal, .modal-close');
                if (alternativeCloseButtons.length > 0) {
                    alternativeCloseButtons.forEach(function(btn) {
                        btn.addEventListener('click', handleCloseButtonClick);
                    });
                    console.log('تم إعداد مستمع لأزرار الإغلاق البديلة');
                }
            }
            
            // 2. إضافة مستمع للنقر خارج النافذة المنبثقة
            const modal = document.getElementById('portfolio-modal');
            if (modal) {
                modal.addEventListener('click', handleBackdropClick);
                console.log('تم إعداد مستمع للنقر خارج النافذة المنبثقة');
            } else {
                console.warn('لم يتم العثور على النافذة المنبثقة #portfolio-modal');
            }
            
            // 3. إضافة مستمع لمفتاح ESC
            document.addEventListener('keydown', handleEscKeyPress);
            console.log('تم إعداد مستمع لمفتاح ESC');
            
            // 4. إضافة مستمع للنقر على عناصر المشروع
            const portfolioItems = document.querySelectorAll('[data-portfolio-id]');
            if (portfolioItems.length > 0) {
                portfolioItems.forEach(function(item) {
                    item.addEventListener('click', handlePortfolioItemClick);
                });
                console.log('تم إعداد مستمعات لـ ' + portfolioItems.length + ' من عناصر المشروع');
            } else {
                console.warn('لم يتم العثور على عناصر المشروع [data-portfolio-id]');
            }
            
            // 5. مستمع لغالق النافذة (إذا كان متاحاً في ملفات JS الخارجية)
            if (typeof window.closePortfolioModal === 'function') {
                const originalCloseModal = window.closePortfolioModal;
                window.closePortfolioModal = function() {
                    console.log('تم استدعاء دالة إغلاق النافذة المنبثقة - إيقاف جميع الفيديوهات');
                    stopAllVideos();
                    originalCloseModal.apply(this, arguments);
                };
                console.log('تم تعديل دالة closePortfolioModal الخارجية');
            }
            
            // 6. مستمع للتنقل بين المشاريع (إذا كان متاحاً في ملفات JS الخارجية)
            if (typeof window.navigateToProject === 'function') {
                const originalNavigate = window.navigateToProject;
                window.navigateToProject = function(projectId) {
                    console.log('تم استدعاء دالة الانتقال بين المشاريع - إيقاف جميع الفيديوهات');
                    stopAllVideos();
                    originalNavigate.apply(this, arguments);
                };
                console.log('تم تعديل دالة navigateToProject الخارجية');
            }
            
            console.log('تم إعداد جميع مستمعي الأحداث بنجاح');
        } catch (err) {
            console.error('خطأ أثناء إعداد مستمعي الأحداث:', err);
        }
    }
    
    // ======================================================
    // إعداد فحص دوري لإيقاف الفيديو
    // ======================================================
    
    function setupPeriodicCheck() {
        console.log('إعداد فحص دوري للتأكد من إيقاف الفيديوهات');
        
        // فحص كل ثانية للتأكد من عدم تشغيل فيديو عندما تكون النافذة المنبثقة مغلقة
        setInterval(function() {
            const modal = document.getElementById('portfolio-modal');
            if (modal) {
                // التحقق من أن النافذة المنبثقة مغلقة
                const isModalHidden = window.getComputedStyle(modal).display === 'none';
                
                if (isModalHidden) {
                    // التحقق من وجود فيديو قيد التشغيل
                    const localVideo = document.getElementById('modal-local-video');
                    const anyVideoPlaying = localVideo && !localVideo.paused;
                    
                    // التحقق من وجود فيديو مضمن
                    const externalVideo = document.getElementById('modal-external-video');
                    const externalVideoLoaded = externalVideo && externalVideo.src && externalVideo.src !== '';
                    
                    if (anyVideoPlaying || externalVideoLoaded) {
                        console.log('تم اكتشاف فيديو قيد التشغيل رغم أن النافذة المنبثقة مغلقة - إيقاف جميع الفيديوهات');
                        stopAllVideos();
                    }
                }
            }
        }, 1000);
        
        console.log('تم إعداد الفحص الدوري بنجاح');
    }
    
    // ======================================================
    // إعادة تحميل مدير الفيديو
    // ======================================================
    
    function reloadVideoManager() {
        console.log('إعادة تهيئة مدير إيقاف تشغيل الفيديو');
        setupEventListeners();
    }
    
    // ======================================================
    // التهيئة الأولية
    // ======================================================
    
    // تهيئة المدير عند تحميل الصفحة
    function initVideoStopManager() {
        console.log('تهيئة مدير إيقاف تشغيل الفيديو');
        
        // إعداد مستمعي الأحداث
        setupEventListeners();
        
        // إعداد الفحص الدوري
        setupPeriodicCheck();
        
        // التعديل على دالة عرض الفيديو الأصلية
        if (typeof window.showVideo === 'function') {
            console.log('تعديل دالة عرض الفيديو الأصلية');
            const originalShowVideo = window.showVideo;
            window.showVideo = function() {
                // استدعاء الدالة الأصلية
                originalShowVideo.apply(this, arguments);
                
                // إعادة إعداد مستمعي الأحداث
                setTimeout(reloadVideoManager, 500);
            };
        }
        
        // إتاحة الدوال عالمياً
        window.portfolioVideoStopManager = {
            stopAllVideos: stopAllVideos,
            reload: reloadVideoManager
        };
        
        console.log('تمت تهيئة مدير إيقاف تشغيل الفيديو بنجاح');
    }
    
    // تفعيل عند اكتمال تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoStopManager);
    } else {
        // الصفحة محملة بالفعل
        initVideoStopManager();
    }
    
    // إعادة الفحص بعد ثواني قليلة (للتأكد من تحميل جميع العناصر)
    setTimeout(function() {
        console.log('إعادة تهيئة مدير إيقاف تشغيل الفيديو (تأخير)');
        initVideoStopManager();
    }, 2000);
})();