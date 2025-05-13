/**
 * متعدد المعايير لتصفية مشاريع المحفظة
 * نظام تصفية متقدم يدمج الفئات, السنة, نوع المحتوى والشعبية
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedFilters();
    loadCategories();
});

// الفلاتر النشطة حاليًا
const activeFilters = {
    category: 'الكل',
    year: '',
    contentType: '',
    popularity: ''
};

/**
 * معالجة البيانات بشكل آمن للحماية من ثغرات XSS
 * @param {string} str - النص المراد معالجته
 * @returns {string} - النص المعالج والآمن
 */
function safeText(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * تهيئة جميع عناصر التصفية المتقدمة
 */
function initializeAdvancedFilters() {
    // عناصر واجهة المستخدم
    const yearFilter = document.getElementById('year-filter');
    const contentTypeFilter = document.getElementById('content-type-filter');
    const popularityFilter = document.getElementById('popularity-filter');
    const searchButton = document.getElementById('search-button');
    const searchResultsCounter = document.getElementById('search-results-counter');
    const noResultsMessage = document.getElementById('no-results-message');

    // إضافة مستمعي الأحداث للفلاتر
    if (yearFilter) {
        yearFilter.addEventListener('change', function() {
            activeFilters.year = this.value;
        });
    }

    if (contentTypeFilter) {
        contentTypeFilter.addEventListener('change', function() {
            activeFilters.contentType = this.value;
        });
    }

    if (popularityFilter) {
        popularityFilter.addEventListener('change', function() {
            activeFilters.popularity = this.value;
        });
    }

    // إضافة مستمع الحدث لزر التصفية
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            applyAllFilters();
        });
    }

    // إضافة مستمع الحدث للإدخال في حقل البحث
    const searchInput = document.getElementById('portfolio-search');
    const clearSearchBtn = document.getElementById('clear-search');
    
    if (searchInput && clearSearchBtn) {
        searchInput.addEventListener('keyup', function(e) {
            // تنفيذ البحث عند الضغط على Enter
            if (e.key === 'Enter') {
                applyAllFilters();
            }
            
            // إظهار أو إخفاء زر المسح بناءً على وجود نص
            if (searchInput.value.trim() !== '') {
                clearSearchBtn.classList.remove('hidden');
            } else {
                clearSearchBtn.classList.add('hidden');
            }
        });
        
        // مستمع حدث زر المسح
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            applyAllFilters(); // إعادة تطبيق الفلاتر بدون مصطلح البحث
        });
    }

    // زر إعادة ضبط البحث
    const resetSearchBtn = document.getElementById('reset-search');
    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', function() {
            resetAllFilters();
        });
    }
}

/**
 * تحميل فئات المشاريع ديناميكيًا وإضافتها إلى واجهة المستخدم
 */
function loadCategories() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const categoriesWrapper = document.getElementById('portfolio-categories');
    const loadingElement = document.querySelector('.categories-loading');
    
    if (!categoriesWrapper || portfolioItems.length === 0) return;
    
    // إخفاء عنصر التحميل بشكل مبدئي
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // جمع جميع الفئات الفريدة من عناصر المحفظة
    const categories = new Set();
    categories.add('الكل'); // إضافة فئة "الكل" افتراضيًا
    
    portfolioItems.forEach(item => {
        const category = item.dataset.category;
        if (category && category.trim() !== '') {
            categories.add(category);
        }
    });
    
    // إنشاء أزرار الفئات
    categories.forEach(category => {
        // التحقق مما إذا كان الزر موجود بالفعل
        const existingButton = categoriesWrapper.querySelector(`[data-category="${category}"]`);
        if (!existingButton) {
            // إنشاء زر جديد فقط إذا لم يكن موجودًا بالفعل
            const button = document.createElement('button');
            button.className = 'category-filter-btn';
            button.dataset.category = category;
            
            if (category === 'الكل') {
                button.classList.add('active'); // تنشيط زر "الكل" افتراضيًا
            }
            
            const span = document.createElement('span');
            span.textContent = category;
            button.appendChild(span);
            
            // إضافة مستمع الحدث للنقر على الزر
            button.addEventListener('click', function() {
                // إزالة الفئة النشطة من جميع الأزرار
                categoriesWrapper.querySelectorAll('.category-filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // إضافة الفئة النشطة للزر المنقر عليه
                this.classList.add('active');
                
                // تحديث الفلتر النشط وتطبيق التصفية
                activeFilters.category = category;
                applyAllFilters();
            });
            
            categoriesWrapper.appendChild(button);
        }
    });
}

/**
 * تطبيق جميع الفلاتر النشطة على عناصر المحفظة باستخدام API
 */
function applyAllFilters() {
    const searchInput = document.getElementById('portfolio-search');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    const searchResultsCounter = document.getElementById('search-results-counter');
    const noResultsMessage = document.getElementById('no-results-message');
    const galleryContainer = document.getElementById('gallery-container');
    
    if (!galleryContainer) return;
    
    // إظهار مؤشر التحميل أو تأثير التعتيم
    galleryContainer.style.opacity = '0.6';
    galleryContainer.style.transition = 'opacity 0.3s ease';
    
    // تجميع بيانات الفلتر
    const filterData = {
        category: activeFilters.category,
        year: activeFilters.year,
        contentType: activeFilters.contentType,
        sortBy: activeFilters.popularity,
        search: searchTerm
    };
    
    // إرسال طلب للحصول على النتائج المفلترة
    fetch('/api/portfolio/filter/advanced', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filterData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // إعادة بناء عناصر المحفظة من البيانات المرجعة
            updatePortfolioItems(data.items);
            
            // تحديث عداد النتائج
            if (searchResultsCounter) {
                if (searchTerm !== '' || activeFilters.year !== '' || 
                    activeFilters.contentType !== '' || activeFilters.popularity !== '' || 
                    activeFilters.category !== 'الكل') {
                    
                    searchResultsCounter.classList.remove('hidden');
                    searchResultsCounter.textContent = `تم العثور على ${data.count} مشروع`;
                    
                    // تنشيط زر إعادة الضبط
                    const resetSearchBtn = document.getElementById('reset-search');
                    if (resetSearchBtn) {
                        resetSearchBtn.classList.remove('hidden');
                    }
                } else {
                    searchResultsCounter.classList.add('hidden');
                    
                    // إخفاء زر إعادة الضبط
                    const resetSearchBtn = document.getElementById('reset-search');
                    if (resetSearchBtn) {
                        resetSearchBtn.classList.add('hidden');
                    }
                }
            }
            
            // إظهار أو إخفاء رسالة "لا توجد نتائج"
            if (noResultsMessage) {
                if (data.count === 0) {
                    noResultsMessage.classList.remove('hidden');
                    galleryContainer.classList.add('hidden');
                } else {
                    noResultsMessage.classList.add('hidden');
                    galleryContainer.classList.remove('hidden');
                }
            }
            
            // إعادة ضبط المؤشر البصري
            galleryContainer.style.opacity = '1';
            
            // إضافة تأثيرات حركية للعناصر الجديدة
            animateVisibleItems();
        } else {
            console.error('خطأ في استعلام الفلاتر المتقدمة:', data.message);
            // استعادة حالة العرض
            galleryContainer.style.opacity = '1';
        }
    })
    .catch(error => {
        console.error('خطأ في طلب الفلاتر المتقدمة:', error);
        // استعادة حالة العرض
        galleryContainer.style.opacity = '1';
        
        // عرض رسالة خطأ صغيرة للمستخدم (اختياري)
        if (searchResultsCounter) {
            searchResultsCounter.classList.remove('hidden');
            searchResultsCounter.textContent = 'حدث خطأ أثناء تطبيق الفلاتر';
            searchResultsCounter.style.color = '#f87171';
            
            // إعادة النص الأصلي بعد 3 ثوان
            setTimeout(() => {
                searchResultsCounter.style.color = '';
                searchResultsCounter.classList.add('hidden');
            }, 3000);
        }
    });
}

/**
 * تحديث عناصر المحفظة بناءً على البيانات المرجعة من API
 * @param {Array} items - قائمة عناصر المحفظة
 */
function updatePortfolioItems(items) {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    
    // تفريغ الحاوية
    container.innerHTML = '';
    
    // إذا لم تكن هناك نتائج
    if (items.length === 0) {
        return;
    }
    
    // إنشاء عناصر المحفظة
    items.forEach((item, index) => {
        // إنشاء عنصر جديد
        const itemElement = document.createElement('div');
        itemElement.className = 'portfolio-item eki-card animated-item';
        itemElement.setAttribute('data-aos', 'zoom-in');
        itemElement.setAttribute('data-aos-delay', `${600 + (index * 100)}`);
        itemElement.setAttribute('data-category', item.category || '');
        itemElement.setAttribute('data-id', item.id);
        itemElement.setAttribute('data-title', item.title || '');
        itemElement.setAttribute('data-description', item.description || '');
        
        // استخراج السنة من تاريخ الإنشاء
        const createdDate = item.created_at ? new Date(item.created_at) : null;
        const year = createdDate ? createdDate.getFullYear().toString() : '';
        itemElement.setAttribute('data-year', year);
        
        itemElement.setAttribute('data-views', item.views_count || '0');
        itemElement.setAttribute('data-likes', item.likes_count || '0');
        itemElement.setAttribute('data-created', item.created_at || '');
        itemElement.setAttribute('data-video', item.has_video ? 'true' : 'false');
        itemElement.setAttribute('data-carousel', item.has_carousel ? 'true' : 'false');
        
        // إنشاء HTML الداخلي
        itemElement.innerHTML = `
            <div class="item-image-wrapper">
                <img src="${item.image_url || '/static/img/placeholder.jpg'}" alt="${safeText(item.title || 'مشروع')}" loading="lazy" class="item-image">
                ${item.has_video ? `
                <div class="video-indicator">
                    <i class="fas fa-play-circle"></i>
                </div>` : ''}
            </div>
            
            <div class="item-overlay">
                <div class="item-content">
                    <h3 class="item-title mb-3 animated-item-title">${safeText(item.title || 'مشروع')}</h3>
                    <div class="item-stats animated-item-stats">
                        <div class="item-stat">
                            <i class="fas fa-heart pulse-on-hover"></i>
                            <span>${item.likes_count || '0'}</span>
                        </div>
                        <div class="item-stat">
                            <i class="fas fa-comment pulse-on-hover"></i>
                            <span>${item.comments_count || '0'}</span>
                        </div>
                        <div class="item-stat">
                            <i class="fas fa-eye pulse-on-hover"></i>
                            <span>${item.views_count || '0'}</span>
                        </div>
                    </div>
                    <div class="item-action animated-button">
                        <span class="view-details">عرض التفاصيل</span>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة حدث النقر - تحقق من وجود الدالة بالطريقة الصحيحة
        itemElement.addEventListener('click', function() {
            try {
                // محاولة استخدام دالة openModal المباشرة إن وجدت
                if (typeof openModal === 'function') {
                    openModal(item.id);
                } 
                // أو استخدام openModal من كائن instagramGalleryModal إن وجد
                else if (window.instagramGalleryModal && typeof window.instagramGalleryModal.openModal === 'function') {
                    window.instagramGalleryModal.openModal(item.id);
                }
                // في حالة وجود الدالة كجزء من سياق صفحة
                else if (typeof window.openModal === 'function') {
                    window.openModal(item.id);
                }
                else {
                    console.error('تعذر العثور على دالة openModal، يرجى التحقق من تضمين الملفات الصحيحة');
                }
            } catch (error) {
                console.error('حدث خطأ أثناء محاولة فتح تفاصيل المشروع:', error);
            }
        });
        
        // إضافة العنصر إلى الحاوية
        container.appendChild(itemElement);
    });
}

/**
 * فرز عناصر المحفظة حسب المعيار المحدد
 * @param {Array} items - مصفوفة عناصر المحفظة
 * @param {string} sortCriteria - معيار الفرز
 */
function sortPortfolioItems(items, sortCriteria) {
    const container = document.querySelector('.portfolio-grid') || document.getElementById('gallery-container');
    if (!container) return;
    
    // تحقق من أن العناصر موجودة ومصفوفة
    if (!Array.isArray(items)) {
        console.error('العناصر المقدمة ليست مصفوفة صالحة', items);
        return;
    }
    
    // عناصر مرتبة حسب المعيار (تفلتر العناصر المخفية)
    let visibleItems = [];
    try {
        visibleItems = items.filter(item => item && !item.classList.contains('hidden'));
    } catch (error) {
        console.error('خطأ أثناء فلترة العناصر المرئية:', error);
        visibleItems = [...items]; // استخدام نسخة من المصفوفة الأصلية
    }
    
    // تطبيق معيار الفرز مع التعامل مع الحالات الاستثنائية
    visibleItems.sort((a, b) => {
        try {
            if (sortCriteria === 'most-viewed') {
                const viewsA = a?.dataset?.views ? parseInt(a.dataset.views) : 0;
                const viewsB = b?.dataset?.views ? parseInt(b.dataset.views) : 0;
                return viewsB - viewsA;
            } else if (sortCriteria === 'most-liked') {
                const likesA = a?.dataset?.likes ? parseInt(a.dataset.likes) : 0;
                const likesB = b?.dataset?.likes ? parseInt(b.dataset.likes) : 0;
                return likesB - likesA;
            } else if (sortCriteria === 'latest') {
                const dateA = a?.dataset?.created ? new Date(a.dataset.created) : new Date(0);
                const dateB = b?.dataset?.created ? new Date(b.dataset.created) : new Date(0);
                return dateB - dateA;
            } else if (sortCriteria === 'oldest') {
                const dateA = a?.dataset?.created ? new Date(a.dataset.created) : new Date(0);
                const dateB = b?.dataset?.created ? new Date(b.dataset.created) : new Date(0);
                return dateA - dateB;
            }
        } catch (error) {
            console.error('خطأ أثناء فرز العناصر:', error);
        }
        return 0;
    });
    
    // إعادة ترتيب العناصر في DOM
    visibleItems.forEach(item => {
        container.appendChild(item);
    });
}

/**
 * إضافة تأثيرات حركية للعناصر المرئية بعد التصفية
 */
function animateVisibleItems() {
    const visibleItems = document.querySelectorAll('.portfolio-item:not(.hidden)');
    
    if (visibleItems && visibleItems.length > 0) {
        visibleItems.forEach((item, index) => {
            // إعادة تعيين فئات التحريك
            item.classList.remove('aos-animate');
            item.style.transitionDelay = '0ms';
            
            // تأخير تدريجي للعناصر
            setTimeout(() => {
                item.classList.add('aos-animate');
                item.style.transitionDelay = `${index * 50}ms`;
            }, 50);
        });
    }
}

/**
 * إعادة ضبط جميع الفلاتر إلى قيمها الافتراضية
 */
function resetAllFilters() {
    // إعادة تعيين قيم الفلاتر النشطة
    activeFilters.category = 'الكل';
    activeFilters.year = '';
    activeFilters.contentType = '';
    activeFilters.popularity = '';
    
    // إعادة تعيين عناصر واجهة المستخدم
    const yearFilter = document.getElementById('year-filter');
    const contentTypeFilter = document.getElementById('content-type-filter');
    const popularityFilter = document.getElementById('popularity-filter');
    const searchInput = document.getElementById('portfolio-search');
    const clearSearchBtn = document.getElementById('clear-search');
    
    if (yearFilter) yearFilter.value = '';
    if (contentTypeFilter) contentTypeFilter.value = '';
    if (popularityFilter) popularityFilter.value = '';
    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
    
    // إعادة تنشيط زر "الكل" في فلتر الفئات
    const categoriesWrapper = document.getElementById('portfolio-categories');
    if (categoriesWrapper) {
        const allButtons = categoriesWrapper.querySelectorAll('.category-filter-btn');
        allButtons.forEach(btn => btn.classList.remove('active'));
        
        const allCategoryBtn = categoriesWrapper.querySelector('[data-category="الكل"]');
        if (allCategoryBtn) {
            allCategoryBtn.classList.add('active');
        }
    }
    
    // إعادة تطبيق الفلاتر (الذي سيظهر جميع العناصر)
    applyAllFilters();
    
    // إخفاء عناصر الواجهة المتعلقة بنتائج البحث
    const searchResultsCounter = document.getElementById('search-results-counter');
    const noResultsMessage = document.getElementById('no-results-message');
    const resetSearchBtn = document.getElementById('reset-search');
    
    if (searchResultsCounter) searchResultsCounter.classList.add('hidden');
    if (noResultsMessage) noResultsMessage.classList.add('hidden');
    if (resetSearchBtn) resetSearchBtn.classList.add('hidden');
}