/**
 * enhanced-homepage-animations.js - تأثيرات حركية محسنة للصفحة الرئيسية
 * 
 * تم إنشاؤه لموقع فراس للتصميم لإضافة تأثيرات أكثر سلاسة وانتقالات أكثر راحة للعين
 */

document.addEventListener('DOMContentLoaded', function() {
  try {
    // تهيئة التأثيرات الحركية المحسنة للصفحة الرئيسية
    initEnhancedEffects();
    
    // تهيئة تأثير الشلال للعناصر عند التمرير
    initParallaxElements();
    
    // تهيئة تأثير تفاعل العناصر مع حركة المؤشر
    initCursorInteraction();
    
    // تفعيل وضع الانتقال السلس في الخلفية
    initSmoothBackgroundTransitions();
  } catch (error) {
    console.error('حدث خطأ أثناء تهيئة التأثيرات المحسنة:', error);
  }
});

/**
 * تهيئة التأثيرات الحركية المحسنة
 */
function initEnhancedEffects() {
  console.log('تهيئة التأثيرات الحركية المحسنة للصفحة الرئيسية...');
  
  // إضافة فئة التحميل المكتمل لعنصر body بطريقة أكثر سلاسة
  setTimeout(function() {
    document.body.classList.add('loaded');
    
    // بدء تأثيرات الظهور المتدرج للعناصر الرئيسية
    const heroSection = document.querySelector('.eki-header');
    if (heroSection) {
      heroSection.classList.add('reveal-hero');
    }
    
    // ظهور العناصر الرئيسية بتدرج منتظم
    const mainElements = document.querySelectorAll('.animated-entrance');
    mainElements.forEach(function(element, index) {
      setTimeout(function() {
        element.classList.add('appear');
      }, 100 + (index * 100)); // تأخير متزايد لكل عنصر
    });
    
    // التأثير التدريجي للفقاعات
    const blobs = document.querySelectorAll('.blob');
    blobs.forEach(function(blob, index) {
      blob.style.transitionDelay = `${index * 0.3}s`;
      blob.classList.add('blob-visible');
    });
  }, 300);
  
  // تحسين تأثير الفقاعات للحركة الأكثر واقعية
  enhanceBlobAnimations();
  
  // تفعيل تأثير التلاشي المتدرج للعناصر المخفية
  const staggeredElements = document.querySelectorAll('.staggered-hero-item');
  staggeredElements.forEach(function(el, index) {
    el.style.transitionDelay = `${index * 0.12}s`; // تأخير متناسق
    setTimeout(function() {
      el.classList.add('fade-in');
    }, 400); // تأخير إضافي للتأكد من ظهور جميع العناصر بعد تحميل الصفحة
  });
}

/**
 * تحسين حركة الفقاعات لتكون أكثر سلاسة وواقعية
 */
function enhanceBlobAnimations() {
  const blobs = document.querySelectorAll('.blob');
  
  blobs.forEach(function(blob) {
    // إضافة تحويل css عشوائي للفقاعات
    const randomOffsetX = Math.random() * 30 - 15; // قيمة عشوائية بين -15 و +15
    const randomOffsetY = Math.random() * 30 - 15;
    const randomScale = 0.85 + (Math.random() * 0.3); // مقياس عشوائي بين 0.85 و 1.15
    
    // تطبيق التحول العشوائي
    blob.style.transform = `translate3d(${randomOffsetX}px, ${randomOffsetY}px, 0) scale(${randomScale})`;
    
    // إضافة حركة تلقائية إضافية
    let lastMouseX = 0;
    let lastMouseY = 0;
    let isMoving = false;
    
    // تأثير حركة خفيفة عند تحريك المؤشر
    document.addEventListener('mousemove', function(e) {
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(function() {
          try {
            // حركة بطيئة تتبع مؤشر الفأرة بشكل غير مباشر
            const deltaX = (e.clientX - lastMouseX) * 0.015;
            const deltaY = (e.clientY - lastMouseY) * 0.015;
            
            // تطبيق حركة خفيفة على الفقاعات
            const currentTransform = blob.style.transform;
            if (currentTransform && typeof currentTransform === 'string') {
              const baseTrans = currentTransform.split(')')[0] || '';
              blob.style.transform = `${baseTrans}) translate3d(${deltaX}px, ${deltaY}px, 0)`;
            }
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
          } catch (err) {
            console.error('خطأ في حركة الفقاعات:', err);
          }
          isMoving = false;
        });
      }
    });
  });
}

/**
 * تهيئة تأثير الشلال للعناصر عند التمرير (Parallax)
 */
function initParallaxElements() {
  // تحديد عناصر التأثير
  const parallaxElements = document.querySelectorAll('.parallax-element');
  
  if (parallaxElements.length > 0) {
    // معالج حدث التمرير
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset;
      
      // تطبيق تأثير الشلال على جميع العناصر
      parallaxElements.forEach(function(element) {
        const speed = element.dataset.speed || 0.5; // سرعة الحركة (الافتراضية: 0.5)
        const direction = element.dataset.direction || 'up'; // اتجاه الحركة (الافتراضي: للأعلى)
        
        let yPos = 0;
        
        if (direction === 'up') {
          yPos = -(scrollTop * speed);
        } else if (direction === 'down') {
          yPos = (scrollTop * speed);
        }
        
        // التطبيق الفعلي للتحويل
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    });
  }
  
  // إضافة تأثير الشلال للجشطالت
  const gestaltElements = document.querySelectorAll('.gestalt-element');
  if (gestaltElements.length > 0) {
    window.addEventListener('scroll', function() {
      gestaltElements.forEach(function(element) {
        const rect = element.getBoundingClientRect();
        const isVisible = (
          rect.top < window.innerHeight &&
          rect.bottom > 0
        );
        
        if (isVisible) {
          const scrollPercentage = 1 - (rect.top / window.innerHeight);
          if (scrollPercentage > 0 && scrollPercentage < 1) {
            const scale = 1 + (scrollPercentage * 0.1);
            const opacity = 0.7 + (scrollPercentage * 0.3);
            
            element.style.transform = `scale(${scale})`;
            element.style.opacity = opacity;
          }
        }
      });
    });
  }
}

/**
 * تهيئة تأثير تفاعل العناصر مع حركة المؤشر
 */
function initCursorInteraction() {
  // العناصر التي ستتفاعل مع حركة المؤشر
  const interactiveElements = document.querySelectorAll('.cursor-interactive');
  
  document.addEventListener('mousemove', function(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    interactiveElements.forEach(function(element) {
      const rect = element.getBoundingClientRect();
      
      // حساب المسافة بين المؤشر والعنصر
      const elementCenterX = rect.left + (rect.width / 2);
      const elementCenterY = rect.top + (rect.height / 2);
      
      // حساب الفرق بين مركز العنصر وموضع المؤشر
      const deltaX = mouseX - elementCenterX;
      const deltaY = mouseY - elementCenterY;
      
      // حساب المسافة باستخدام نظرية فيثاغورس
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // تأثير "الجذب" أو "الطرد" بناءً على المسافة
      if (distance < 400) { // نطاق التأثير (400 بكسل)
        // حساب قوة التأثير بناءً على المسافة (تأثير أقوى عندما تكون المسافة أقصر)
        const strength = 0.15 * (1 - (distance / 400));
        
        // اتجاه التأثير حسب نوع العنصر
        const direction = element.classList.contains('attract') ? 1 : -1;
        
        // حساب قيمة الإزاحة
        const moveX = deltaX * strength * direction;
        const moveY = deltaY * strength * direction;
        
        // تطبيق الإزاحة بتأثير تخفيف سلس
        element.style.transition = 'transform 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
        element.style.transform = `translate(${moveX}px, ${moveY}px)`;
      } else {
        // إعادة العنصر إلى موضعه الأصلي
        element.style.transition = 'transform 1s cubic-bezier(0.19, 1, 0.22, 1)';
        element.style.transform = 'translate(0, 0)';
      }
    });
  });
  
  // إعادة العناصر إلى موضعها الأصلي عند مغادرة المؤشر
  document.addEventListener('mouseleave', function() {
    interactiveElements.forEach(function(element) {
      element.style.transition = 'transform 1s cubic-bezier(0.19, 1, 0.22, 1)';
      element.style.transform = 'translate(0, 0)';
    });
  });
}

/**
 * تفعيل وضع الانتقال السلس في الخلفية
 */
function initSmoothBackgroundTransitions() {
  // التبديل السلس لألوان الخلفية عند التمرير
  let lastScrollTop = 0;
  const transitionThreshold = 200; // عتبة التمرير (بالبكسل) لبدء الانتقال
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = scrollTop - lastScrollTop;
    
    // تحديد اتجاه التمرير
    const direction = scrollDelta > 0 ? 'down' : 'up';
    
    // التبديل السلس للخلفية بناءً على الاتجاه
    if (Math.abs(scrollDelta) > 50) { // عتبة التغيير
      if (direction === 'down' && scrollTop > transitionThreshold) {
        document.body.classList.add('scrolled-down');
      } else if (direction === 'up' && scrollTop < transitionThreshold) {
        document.body.classList.remove('scrolled-down');
      }
    }
    
    // تحديث آخر موضع تمرير
    lastScrollTop = scrollTop;
  });
  
  // تطبيق تأثيرات على النصوص والأيقونات عند التمرير
  const textElements = document.querySelectorAll('.animate-on-scroll');
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const textObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('text-animated');
      } else {
        entry.target.classList.remove('text-animated');
      }
    });
  }, observerOptions);
  
  textElements.forEach(function(element) {
    textObserver.observe(element);
  });
}

/**
 * تحديث وإعادة تهيئة جميع التأثيرات
 */
function refreshHomepageEffects() {
  console.log('تحديث التأثيرات الحركية المحسنة...');
  
  // إعادة تهيئة جميع التأثيرات
  initEnhancedEffects();
  initParallaxElements();
  initCursorInteraction();
  initSmoothBackgroundTransitions();
  
  // إعادة تفعيل العناصر المتدرجة (خاصة بعد التحميل الديناميكي للمحتوى)
  const staggeredElements = document.querySelectorAll('.staggered-hero-item:not(.fade-in)');
  staggeredElements.forEach(function(el, index) {
    el.style.transitionDelay = `${index * 0.12}s`;
    el.classList.add('fade-in');
  });
}

// تصدير الدوال للاستخدام الخارجي
window.EnhancedHomepage = {
  refresh: refreshHomepageEffects,
  enhanceBlobAnimations: enhanceBlobAnimations,
  initParallaxElements: initParallaxElements,
  initCursorInteraction: initCursorInteraction
};