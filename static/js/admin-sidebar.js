/**
 * تنفيذ جديد بالكامل للقائمة الجانبية
 * يعالج المشكلة بشكل مختلف ويتجنب أي تداخل مع مكتبات أخرى
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('تحميل نظام القائمة الجانبية المحسنة...');
    
    // تعطيل سلوك Bootstrap للقوائم المنسدلة
    disableBootstrapCollapse();
    
    // تهيئة القائمة المنسدلة
    setupSidebarDropdowns();
    
    // استجابة لتغييرات حجم الشاشة
    window.addEventListener('resize', adjustSidebarForMobile);
    adjustSidebarForMobile();
    
    // إضافة تأثيرات بصرية
    addSidebarStyles();
    
    console.log('تم تحميل القائمة الجانبية بنجاح!');
});

/**
 * تعطيل آلية الطي التلقائية من Bootstrap
 * لضمان عدم تداخل السلوك الافتراضي مع السلوك المخصص
 */
function disableBootstrapCollapse() {
    // إزالة سمات Bootstrap الخاصة بالقوائم المنسدلة لمنع السلوك التلقائي
    document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(item => {
        // الحفاظ على سمة aria-controls لأننا نستخدمها لتحديد الهدف
        const controlId = item.getAttribute('aria-controls');
        
        // إزالة سمات Bootstrap للتحكم اليدوي بالسلوك
        item.removeAttribute('data-bs-toggle');
        
        // الاحتفاظ بمعرف عنصر الهدف
        if (controlId) {
            item.setAttribute('data-target-id', controlId);
        }
    });
}

/**
 * إعداد القوائم المنسدلة بنهج جديد
 * يستخدم العناصر الأصلية مع تجاوز سلوك bootstrap الافتراضي
 */
function setupSidebarDropdowns() {
    // العثور على كافة العناصر الرئيسية في القائمة (التي تحتوي على قوائم منسدلة)
    // نستخدم aria-controls بدلاً من data-bs-toggle لأننا قمنا بإزالة السمة الأخيرة
    const dropdownToggles = document.querySelectorAll('.nav-link.menu-item[aria-controls]');
    
    // إزالة أي سلوك تلقائي من bootstrap للتحكم بشكل كامل
    dropdownToggles.forEach(toggle => {
        // نسخ العنصر لإزالة أي معالجات أحداث سابقة
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
        
        // الحصول على معرف القائمة المنسدلة المرتبطة
        const targetId = newToggle.getAttribute('aria-controls');
        const targetElement = document.getElementById(targetId);
        
        if (!targetElement) return;
        
        // إعداد الحالة الأولية (فتح القائمة المنسدلة إذا كانت نشطة)
        if (newToggle.getAttribute('aria-expanded') === 'true') {
            targetElement.classList.add('show');
        } else {
            targetElement.classList.remove('show');
        }
        
        // إضافة معالج الأحداث المباشر والفعال (ضغطة واحدة فقط)
        newToggle.onclick = function(event) {
            // منع السلوك الافتراضي وانتشار الحدث
            event.preventDefault();
            event.stopPropagation();
            
            // الحصول على الحالة الحالية
            const isExpanded = newToggle.getAttribute('aria-expanded') === 'true';
            
            // تبديل حالة القائمة المنسدلة بشكل فوري
            if (isExpanded) {
                // إذا كانت مفتوحة، نغلقها فوراً بضغطة واحدة مع أنيميشن
                newToggle.setAttribute('aria-expanded', 'false');
                
                // إضافة تأثير الأنيميشن عند الإغلاق
                targetElement.style.height = targetElement.scrollHeight + 'px';
                
                // تشغيل الأنيميشن (بعد تأخير بسيط جداً للسماح للمتصفح بمعالجة التغيير)
                setTimeout(() => {
                    targetElement.style.height = '0px';
                    targetElement.style.opacity = '0';
                    
                    // إزالة الكلاس .show بعد انتهاء الأنيميشن
                    setTimeout(() => {
                        targetElement.classList.remove('show');
                        targetElement.style.height = '';
                        targetElement.style.opacity = '';
                    }, 300);
                }, 10);
            } else {
                // قبل الفتح، إغلاق جميع القوائم المنسدلة الأخرى
                dropdownToggles.forEach(otherToggle => {
                    if (otherToggle !== newToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                        const otherId = otherToggle.getAttribute('aria-controls');
                        const otherTarget = document.getElementById(otherId);
                        if (otherTarget) {
                            otherTarget.classList.remove('show');
                        }
                    }
                });
                
                // فتح القائمة المنسدلة الحالية مع أنيميشن
                newToggle.setAttribute('aria-expanded', 'true');
                targetElement.classList.add('show');
                
                // تحضير الأنيميشن
                targetElement.style.height = '0px';
                targetElement.style.opacity = '0';
                
                // تشغيل أنيميشن الفتح (بعد تأخير بسيط جداً للسماح للمتصفح بمعالجة التغيير)
                setTimeout(() => {
                    const height = targetElement.scrollHeight;
                    targetElement.style.height = height + 'px';
                    targetElement.style.opacity = '1';
                    
                    // إعادة التعيين بعد انتهاء الأنيميشن
                    setTimeout(() => {
                        targetElement.style.height = '';
                    }, 300);
                }, 10);
            }
            
            // إيقاف أي أحداث أخرى قد تتداخل
            return false;
        };
        
        // تنشيط القائمة الرئيسية إذا كانت تحتوي على عنصر نشط
        const hasActiveItem = targetElement.querySelector('.submenu-item.active');
        if (hasActiveItem) {
            newToggle.setAttribute('aria-expanded', 'true');
            targetElement.classList.add('show');
        }
    });
}

/**
 * ضبط سلوك القائمة الجانبية للأجهزة المحمولة
 */
function adjustSidebarForMobile() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (!sidebar) return;
    
    const isMobile = window.innerWidth < 992;
    
    if (isMobile) {
        sidebar.classList.add('mobile-view');
    } else {
        sidebar.classList.remove('mobile-view');
    }
}

/**
 * إضافة تأثيرات بصرية للقائمة الجانبية
 */
function addSidebarStyles() {
    // إنشاء عنصر style جديد
    const style = document.createElement('style');
    
    // إضافة قواعد CSS للتأثيرات الحركية
    style.textContent = `
        /* تأثير سلس لأيقونة السهم */
        .admin-sidebar .nav-link i.fa-chevron-down {
            transition: transform 0.3s ease;
        }
        
        /* تأثير سلس للقائمة المنسدلة */
        .admin-sidebar .collapse {
            transition: height 0.3s ease, opacity 0.3s ease;
            overflow: hidden;
        }
        
        /* دوران السهم عند فتح القائمة */
        .admin-sidebar .nav-link[aria-expanded="true"] i.fa-chevron-down {
            transform: rotate(180deg);
        }
        
        /* إعادة السهم للوضع الطبيعي عند إغلاق القائمة */
        .admin-sidebar .nav-link[aria-expanded="false"] i.fa-chevron-down {
            transform: rotate(0deg);
        }
        
        /* خصائص القائمة المنسدلة - لمنع الوميض */
        .admin-sidebar .collapse {
            opacity: 1;
            transform-origin: top;
        }
        
        /* خصائص القائمة المغلقة */
        .admin-sidebar .collapse:not(.show) {
            display: none;
            opacity: 0;
            height: 0;
        }
        
        /* تأثير الانتقال عند الفتح والإغلاق */
        .admin-sidebar .submenu-item {
            transform: translateX(0);
            transition: transform 0.3s ease, opacity 0.2s ease;
            opacity: 1;
        }
        
        /* تأثير دخول العناصر الفرعية */
        .admin-sidebar .collapse.show .submenu-item {
            animation: slideInRight 0.3s forwards;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(20px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        /* تحسين مظهر القائمة عند الضغط */
        .admin-sidebar .nav-link.menu-item:active {
            transform: scale(0.98);
        }
    `;
    
    // إضافة العنصر إلى رأس المستند
    document.head.appendChild(style);
}