/**
 * كاروسيل أفقي تكراري جذاب مع تأثيرات
 * Enhanced Horizontal Infinite Loop Carousel
 */

document.addEventListener('DOMContentLoaded', function() {
  // تأخير تهيئة الكاروسيل لتجنب تعليق الصفحة
  setTimeout(function() {
    initEnhancedCarousel();
  }, 300);
});

/**
 * تهيئة كاروسيل محسن مع تأثيرات جذابة دون تعليق
 */
function initEnhancedCarousel() {
  const carousel = document.querySelector('.horizontal-carousel');
  
  if (!carousel) {
    console.log('لم يتم العثور على عنصر الكاروسيل');
    return;
  }
  
  // تهيئة كاروسيل Swiper مع الإعدادات المحسنة
  try {
    const horizontalSwiper = new Swiper('.horizontal-carousel', {
      // الإعدادات الأساسية
      slidesPerView: 1,
      spaceBetween: 30,
      grabCursor: true,
      
      // تكرار لانهائي للشرائح
      loop: true,
      loopAdditionalSlides: 3,
      
      // تحديد موضع الشريحة النشطة في المنتصف
      centeredSlides: true,
      
      // تأثيرات 3D محسنة (مظهر جذاب)
      effect: 'coverflow',
      coverflowEffect: {
        rotate: 2,
        stretch: 0,
        depth: 100,
        modifier: 1.2,
        slideShadows: false,
      },
      
      // تشغيل تلقائي كل 2 ثانية
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true, // التوقف عند التحويم بالمؤشر
      },
      
      // أسهم التنقل
      navigation: {
        nextEl: '.horizontal-carousel .swiper-button-next',
        prevEl: '.horizontal-carousel .swiper-button-prev',
      },
      
      // نقاط التنقل
      pagination: {
        el: '.horizontal-carousel .swiper-pagination',
        clickable: true
      },
      
      // سرعة الانتقال
      speed: 800,
      
      // إعدادات الاستجابة لأحجام الشاشات المختلفة
      breakpoints: {
        480: { slidesPerView: 1.5 },
        640: { slidesPerView: 2 },
        768: { slidesPerView: 2.5 },
        1024: { slidesPerView: 3 },
        1280: { slidesPerView: 4 }
      },
      
      // تحسين الأداء
      observer: true,
      observeParents: true,
      
      // تحميل الصور المتكاسل
      preloadImages: true,
      lazy: {
        loadPrevNext: true
      },
      
      // إضافة تأثيرات عند التهيئة
      on: {
        init: function() {
          console.log('تم تهيئة الكاروسيل بنجاح');
          // إضافة مستمعي الأحداث بعد مهلة قصيرة
          setTimeout(() => {
            addSlideEffects();
          }, 500);
        }
      }
    });
    
  } catch (error) {
    console.error('حدث خطأ أثناء تهيئة الكاروسيل:', error);
  }
}

/**
 * إضافة تأثيرات للشرائح
 */
function addSlideEffects() {
  const slides = document.querySelectorAll('.horizontal-slide');
  const swiperInstance = document.querySelector('.horizontal-carousel')?.swiper;
  
  if (!slides.length || !swiperInstance) return;
  
  // إضافة تأثير التحويم لكل شريحة
  slides.forEach((slide) => {
    // عند التحويم على الشريحة
    slide.addEventListener('mouseenter', function() {
      // إضافة صنف للشريحة النشطة
      this.classList.add('active-slide');
      
      // إيقاف التشغيل التلقائي عند التحويم
      if (swiperInstance && swiperInstance.autoplay && swiperInstance.autoplay.running) {
        swiperInstance.autoplay.stop();
      }
    });
    
    // عند مغادرة التحويم
    slide.addEventListener('mouseleave', function() {
      // إزالة صنف الشريحة النشطة
      this.classList.remove('active-slide');
      
      // إعادة تشغيل العرض التلقائي
      if (swiperInstance && swiperInstance.autoplay && !swiperInstance.autoplay.running) {
        swiperInstance.autoplay.start();
      }
    });
  });
}