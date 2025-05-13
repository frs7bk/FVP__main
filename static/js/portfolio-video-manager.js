/**
 * مدير تشغيل وإيقاف فيديوهات معرض الأعمال
 * تاريخ: 2025-05-09
 */

console.log('تم تحميل مدير الفيديو الجديد - نسخة 2025-05-09');

// كائن عام لإدارة تشغيل الفيديو
const PortfolioVideoManager = {
    // حالة تشغيل الفيديو
    isVideoPlaying: false,
    
    // نوع الفيديو الحالي (محلي أو خارجي)
    currentVideoType: null,
    
    // عنصر الفيديو الحالي
    currentVideoElement: null,
    
    // دالة تشغيل فيديو
    playVideo: function(videoType, videoElement) {
        console.log(`تشغيل فيديو جديد (${videoType})`);
        
        // إيقاف أي فيديو حالي
        this.stopCurrentVideo();
        
        // تحديث بيانات الفيديو الحالي
        this.isVideoPlaying = true;
        this.currentVideoType = videoType;
        this.currentVideoElement = videoElement;
    },
    
    // دالة إيقاف الفيديو الحالي
    stopCurrentVideo: function() {
        console.log('محاولة إيقاف الفيديو الحالي');
        
        if (!this.isVideoPlaying || !this.currentVideoElement) {
            console.log('لا يوجد فيديو قيد التشغيل حاليًا');
            return;
        }
        
        console.log(`إيقاف الفيديو الحالي (${this.currentVideoType})`);
        
        if (this.currentVideoType === 'local') {
            // إيقاف الفيديو المحلي
            try {
                this.currentVideoElement.pause();
                this.currentVideoElement.currentTime = 0;
                console.log('تم إيقاف الفيديو المحلي بنجاح');
            } catch (err) {
                console.error('خطأ في إيقاف الفيديو المحلي:', err);
            }
        } else if (this.currentVideoType === 'external') {
            // إيقاف الفيديو الخارجي
            try {
                this.currentVideoElement.src = '';
                console.log('تم إيقاف الفيديو الخارجي بنجاح');
            } catch (err) {
                console.error('خطأ في إيقاف الفيديو الخارجي:', err);
            }
        }
        
        // إعادة تعيين بيانات الفيديو
        this.isVideoPlaying = false;
        this.currentVideoType = null;
        this.currentVideoElement = null;
    },
    
    // دالة إيقاف جميع الفيديوهات في الصفحة
    stopAllVideos: function() {
        console.log('إيقاف جميع الفيديوهات في الصفحة');
        
        // إيقاف الفيديو الحالي
        this.stopCurrentVideo();
        
        // إيقاف جميع عناصر الفيديو HTML5
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            try {
                if (!video.paused) {
                    video.pause();
                }
                video.currentTime = 0;
            } catch (err) {
                console.error('خطأ في إيقاف فيديو HTML5:', err);
            }
        });
        
        // إيقاف جميع الفيديوهات المضمنة (iframe)
        const iframes = document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"]');
        iframes.forEach(iframe => {
            try {
                iframe.src = '';
            } catch (err) {
                console.error('خطأ في إيقاف فيديو مضمن:', err);
            }
        });
    },
    
    // دالة تهيئة مراقبة أحداث النافذة المنبثقة
    init: function() {
        console.log('تهيئة مدير فيديو معرض الأعمال...');
        
        // تسجيل الدالة في النافذة العامة
        window.portfolioVideoManager = this;
        
        // مراقبة أحداث النافذة المنبثقة
        this.setupEventListeners();
        
        // فحص دوري
        this.startPeriodicCheck();
    },
    
    // تفعيل مراقبة أحداث النافذة المنبثقة
    setupEventListeners: function() {
        console.log('إعداد مراقبة أحداث النافذة المنبثقة');
        
        // عند إغلاق النافذة المنبثقة
        document.addEventListener('click', (event) => {
            // التحقق من النقر على زر الإغلاق
            if (event.target.id === 'close-modal' || event.target.classList.contains('close-modal')) {
                console.log('تم النقر على زر الإغلاق - إيقاف الفيديو');
                this.stopAllVideos();
            }
            
            // التحقق من النقر خارج النافذة المنبثقة
            const modal = document.getElementById('portfolio-modal');
            if (modal && event.target === modal) {
                console.log('تم النقر خارج النافذة المنبثقة - إيقاف الفيديو');
                this.stopAllVideos();
            }
        });
        
        // عند الضغط على ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                console.log('تم الضغط على زر ESC - إيقاف الفيديو');
                this.stopAllVideos();
            }
        });
        
        // عند النقر على عنصر مشروع (للتنقل بين المشاريع)
        const portfolioItems = document.querySelectorAll('[data-portfolio-id]');
        portfolioItems.forEach(item => {
            item.addEventListener('click', () => {
                console.log('تم النقر على عنصر مشروع - إيقاف الفيديو السابق');
                this.stopAllVideos();
            });
        });
    },
    
    // بدء فحص دوري للتأكد من إيقاف الفيديو عند إغلاق النافذة المنبثقة
    startPeriodicCheck: function() {
        console.log('بدء الفحص الدوري للتأكد من إيقاف الفيديو');
        
        setInterval(() => {
            const modal = document.getElementById('portfolio-modal');
            if (modal && window.getComputedStyle(modal).display === 'none' && this.isVideoPlaying) {
                console.log('تم اكتشاف فيديو يعمل رغم أن النافذة المنبثقة مغلقة - إيقاف الفيديو');
                this.stopAllVideos();
            }
        }, 1000);
    }
};

// تفعيل المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    PortfolioVideoManager.init();
    
    // تعديل دالة عرض الفيديو
    const originalShowVideo = window.showPortfolioVideo;
    if (originalShowVideo) {
        window.showPortfolioVideo = function() {
            // تنفيذ الدالة الأصلية
            originalShowVideo.apply(this, arguments);
            
            // تسجيل الفيديو في المدير
            setTimeout(() => {
                // التحقق من نوع الفيديو
                const videoType = document.getElementById('modal-video-type').value;
                if (videoType === 'external') {
                    const externalVideo = document.getElementById('modal-external-video');
                    if (externalVideo) {
                        PortfolioVideoManager.playVideo('external', externalVideo);
                    }
                } else {
                    const localVideo = document.getElementById('modal-local-video');
                    if (localVideo) {
                        PortfolioVideoManager.playVideo('local', localVideo);
                    }
                }
            }, 300);
        };
    }
    
    // تعديل دالة إخفاء الفيديو
    const originalHideVideo = window.hidePortfolioVideo;
    if (originalHideVideo) {
        window.hidePortfolioVideo = function() {
            // إيقاف الفيديو في المدير
            PortfolioVideoManager.stopCurrentVideo();
            
            // تنفيذ الدالة الأصلية
            originalHideVideo.apply(this, arguments);
        };
    }
});