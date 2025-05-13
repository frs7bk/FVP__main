/**
 * ملف JavaScript خاص بإضافة زر الفيديو في شريط الأزرار
 * نسخة 2.0 تجاوز مشكلة التخزين المؤقت
 */

console.log('تم تحميل ملف زر الفيديو المضمن الجديد v2.0');

// تنفيذ الإجراء فوراً
(function() {
    console.log('جاري البحث عن شريط الأزرار...');
    
    // انتظر قليلاً لضمان تحميل عناصر DOM
    setTimeout(function() {
        // البحث عن شريط الأزرار
        const actionsContainer = document.querySelector('.modal-actions');
        console.log('تم العثور على شريط الأزرار:', !!actionsContainer);
        
        if (actionsContainer) {
            // حذف الزر القديم إذا وجد
            const oldButton = document.getElementById('show-video-btn-inline');
            if (oldButton) {
                console.log('حذف الزر القديم');
                oldButton.remove();
            }
            
            // إنشاء زر جديد
            console.log('إنشاء زر فيديو جديد');
            const videoButton = document.createElement('button');
            videoButton.id = 'show-video-btn-inline';
            videoButton.type = 'button';
            videoButton.innerHTML = '<i class="fas fa-play-circle"></i>';
            
            // تطبيق التنسيقات
            Object.assign(videoButton.style, {
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                margin: '0 5px',
                padding: '8px 12px',
                display: 'none', // مخفي بشكل افتراضي
                animation: 'glow 1.5s infinite alternate'
            });
            
            // إضافة مستمع الحدث
            videoButton.addEventListener('click', function() {
                console.log('تم النقر على زر الفيديو في شريط الأزرار v2');
                // محاولة استدعاء دالة عرض الفيديو بعدة طرق
                if (typeof window.showPortfolioVideo === 'function') {
                    window.showPortfolioVideo();
                } else if (typeof window.showVideo === 'function') {
                    window.showVideo();
                } else {
                    console.log('جاري البحث عن وظيفة عرض الفيديو...');
                    
                    // استدعاء مباشر لوظيفة عرض الفيديو
                    const hasVideo = document.getElementById('modal-has-video').value === '1';
                    if (hasVideo) {
                        const imageContainer = document.getElementById('modal-image-container');
                        const videoContainer = document.getElementById('modal-video-container');
                        const videoType = document.getElementById('modal-video-type').value;
                        
                        if (imageContainer && videoContainer) {
                            // إخفاء حاوية الصورة وإظهار حاوية الفيديو
                            imageContainer.style.display = 'none';
                            videoContainer.style.display = 'block';
                            
                            // تفعيل الفيديو الخارجي أو المحلي
                            if (videoType === 'external') {
                                const externalVideoContainer = document.getElementById('modal-external-video-container');
                                const localVideoContainer = document.getElementById('modal-local-video-container');
                                if (externalVideoContainer && localVideoContainer) {
                                    externalVideoContainer.style.display = 'block';
                                    localVideoContainer.style.display = 'none';
                                }
                            } else {
                                const externalVideoContainer = document.getElementById('modal-external-video-container');
                                const localVideoContainer = document.getElementById('modal-local-video-container');
                                const localVideo = document.getElementById('modal-local-video');
                                if (externalVideoContainer && localVideoContainer && localVideo) {
                                    externalVideoContainer.style.display = 'none';
                                    localVideoContainer.style.display = 'block';
                                    localVideo.play().catch(e => console.log('لم يتم تشغيل الفيديو تلقائياً:', e));
                                }
                            }
                        }
                    } else {
                        alert('لا يوجد فيديو لهذا المشروع');
                    }
                }
            });
            
            // إضافة الزر إلى الحاوية (قبل الزر الأخير)
            if (actionsContainer.childElementCount > 0) {
                actionsContainer.insertBefore(videoButton, actionsContainer.lastElementChild);
            } else {
                actionsContainer.appendChild(videoButton);
            }
            
            // إضافة تعريف الرسوم المتحركة إذا لم يكن موجوداً
            if (!document.getElementById('glow-animation-style')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'glow-animation-style';
                styleElement.textContent = `
                    @keyframes glow {
                        from { box-shadow: 0 0 5px rgba(40, 167, 69, 0.5); }
                        to { box-shadow: 0 0 15px rgba(40, 167, 69, 0.8); }
                    }
                `;
                document.head.appendChild(styleElement);
            }
            
            // التحقق من وجود فيديو وإظهار الزر إن كان متاحاً
            const hasVideo = document.getElementById('modal-has-video');
            if (hasVideo && hasVideo.value === '1') {
                console.log('يوجد فيديو، سيتم إظهار الزر');
                videoButton.style.display = 'inline-block';
            } else {
                console.log('لا يوجد فيديو، الزر مخفي');
            }
            
            // إضافة مراقب لتغيير قيمة وجود الفيديو
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' || mutation.attributeName === 'value') {
                        const newValue = hasVideo.value;
                        console.log('تغيرت قيمة وجود الفيديو إلى:', newValue);
                        videoButton.style.display = newValue === '1' ? 'inline-block' : 'none';
                    }
                });
            });
            
            if (hasVideo) {
                observer.observe(hasVideo, { attributes: true });
            }
        }
    }, 500); // انتظار نصف ثانية
    
    // إضافة مستمع لفتح النافذة المنبثقة
    document.addEventListener('click', function(event) {
        if (event.target.closest('[data-portfolio-id]')) {
            console.log('تم النقر على عنصر المحفظة، سيتم تحميل الزر بعد لحظات...');
            setTimeout(function() {
                const actionsContainer = document.querySelector('.modal-actions');
                const hasVideo = document.getElementById('modal-has-video');
                const videoBtnInline = document.getElementById('show-video-btn-inline');
                
                if (actionsContainer && hasVideo && videoBtnInline) {
                    console.log('تحديث حالة زر الفيديو بعد فتح النافذة المنبثقة');
                    const shouldShow = hasVideo.value === '1';
                    videoBtnInline.style.display = shouldShow ? 'inline-block' : 'none';
                    console.log('حالة الزر:', shouldShow ? 'ظاهر' : 'مخفي');
                }
            }, 800);
        }
    });
})();