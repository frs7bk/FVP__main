/**
 * Portfolio Featured Projects Carousel
 * 
 * Features:
 * - Horizontal infinite loop carousel
 * - Responsive (shows 3+ slides depending on screen size)
 * - Autoplay with smooth transitions
 * - Pause on hover
 * - Overlay text and zoom effect on hover
 * - Optimized for all devices
 */

document.addEventListener('DOMContentLoaded', function() {
  // Wait for DOM to be fully loaded
  initPortfolioCarousel();
});

/**
 * Initialize the portfolio featured carousel
 */
function initPortfolioCarousel() {
  const featuredSwiperElement = document.getElementById('featuredSwiper');
  if (!featuredSwiperElement) return;

  console.log('تهيئة كاروسيل المشاريع الرائجة...');

  // التأكد من وجود مكتبة Swiper
  if (typeof Swiper === 'undefined') {
    console.error('⚠️ مكتبة Swiper غير موجودة');
    loadSwiperLibrary();
    return;
  }

  // تهيئة الكاروسيل
  try {
    const portfolioSwiper = new Swiper('#featuredSwiper', {
      // إعدادات عرض الشرائح
      slidesPerView: 1, // الإعداد الافتراضي للأجهزة الصغيرة
      spaceBetween: 16,
      centeredSlides: false,
      loop: true,
      loopAdditionalSlides: 3,
      
      // التحرك التلقائي
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      },
      
      // تأثيرات الانتقال
      speed: 800,
      effect: 'slide',
      grabCursor: true,
      
      // أزرار التنقل
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      
      // الاستجابة لمختلف أحجام الشاشة
      breakpoints: {
        // الأجهزة المحمولة الصغيرة
        480: {
          slidesPerView: 1,
          spaceBetween: 10
        },
        // الأجهزة المحمولة
        640: {
          slidesPerView: 2,
          spaceBetween: 15
        },
        // الأجهزة اللوحية
        768: {
          slidesPerView: 2,
          spaceBetween: 20
        },
        // أجهزة الكمبيوتر المحمولة والأجهزة الكبيرة
        1024: {
          slidesPerView: 3,
          spaceBetween: 24
        },
        // الشاشات الكبيرة
        1280: {
          slidesPerView: 4,
          spaceBetween: 30
        }
      },
      
      // معالجة الأحداث
      on: {
        init: function() {
          console.log('✅ تم تهيئة كاروسيل المشاريع الرائجة بنجاح');
          setupHoverEffects();
        },
        slideChange: function() {
          // يمكن إضافة تأثيرات إضافية عند تغيير الشريحة هنا
        }
      }
    });

    // إضافة استماع لأحداث النوافذ لتحديث الكاروسيل عند تغيير حجم الشاشة
    window.addEventListener('resize', function() {
      if (portfolioSwiper) {
        portfolioSwiper.update();
      }
    });

  } catch (error) {
    console.error('خطأ في تهيئة كاروسيل المشاريع الرائجة:', error);
  }
}

/**
 * Setup hover effects for portfolio cards
 */
function setupHoverEffects() {
  // الحصول على جميع بطاقات المشاريع في الكاروسيل
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  
  portfolioCards.forEach(card => {
    const cardInner = card.querySelector('.portfolio-card-inner');
    if (!cardInner) return;
    
    // إضافة مستمع أحداث للتحويم على البطاقة
    cardInner.addEventListener('mouseenter', function() {
      // إيقاف التشغيل التلقائي للكاروسيل إذا كانت مهيأة
      const swiper = document.querySelector('#featuredSwiper')?.swiper;
      if (swiper && swiper.autoplay && swiper.autoplay.running) {
        swiper.autoplay.stop();
      }
      
      // تطبيق تأثير التكبير على الصورة
      const image = this.querySelector('img');
      if (image) {
        image.style.transform = 'scale(1.10)';
      }
    });
    
    // إضافة مستمع أحداث للخروج من التحويم على البطاقة
    cardInner.addEventListener('mouseleave', function() {
      // استئناف التشغيل التلقائي للكاروسيل
      const swiper = document.querySelector('#featuredSwiper')?.swiper;
      if (swiper && swiper.autoplay && !swiper.autoplay.running) {
        // تأخير قصير قبل استئناف التشغيل التلقائي
        setTimeout(() => {
          swiper.autoplay.start();
        }, 300);
      }
      
      // إعادة تعيين حجم الصورة
      const image = this.querySelector('img');
      if (image) {
        image.style.transform = 'scale(1)';
      }
    });
  });
}

/**
 * تحميل مكتبة Swiper إذا لم تكن موجودة
 */
function loadSwiperLibrary() {
  console.log('جاري تحميل مكتبة Swiper...');
  
  // إضافة رابط CSS للمكتبة
  const swiperCSS = document.createElement('link');
  swiperCSS.rel = 'stylesheet';
  swiperCSS.href = 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css';
  document.head.appendChild(swiperCSS);
  
  // إضافة سكريبت JavaScript للمكتبة
  const swiperScript = document.createElement('script');
  swiperScript.src = 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js';
  
  // عند اكتمال التحميل، قم بتهيئة الكاروسيل
  swiperScript.onload = function() {
    console.log('✅ تم تحميل مكتبة Swiper بنجاح');
    initPortfolioCarousel();
  };
  
  document.head.appendChild(swiperScript);
}