/**
 * معالج نموذج الاتصال
 * يتعامل مع إرسال نموذج الاتصال ويعرض رسائل مناسبة
 */

document.addEventListener('DOMContentLoaded', function() {
    // البحث عن عنصر نموذج الاتصال
    const contactForm = document.querySelector('form#contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // إنشاء مؤشر التحميل
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'جاري الإرسال...';
            submitButton.disabled = true;
            
            // الحصول على بيانات النموذج
            const formData = new FormData(contactForm);
            
            // إرسال بيانات النموذج باستخدام fetch
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    // لا تحدد Content-Type مع FormData لأن المتصفح يقوم بتعيينه تلقائيًا مع boundary
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('حدث خطأ في إرسال النموذج');
                }
                return response.json();
            })
            .then(data => {
                // مسح النموذج
                contactForm.reset();
                
                // إنشاء وإظهار رسالة النجاح
                showSuccessMessage(contactForm, data.message || 'تم إرسال رسالتك بنجاح! سنقوم بالرد عليك في أقرب وقت ممكن.');
                
                // إعادة تعيين الزر
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            })
            .catch(error => {
                // إظهار رسالة الخطأ
                showErrorMessage(contactForm, error.message);
                
                // إعادة تعيين الزر
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
});

/**
 * عرض رسالة نجاح جميلة بعد إرسال النموذج
 * @param {HTMLFormElement} form - عنصر النموذج
 * @param {string} message - نص الرسالة
 */
function showSuccessMessage(form, message) {
    // إزالة أي رسائل موجودة
    removeMessages(form);
    
    // إنشاء حاوية رسالة النجاح
    const successDiv = document.createElement('div');
    successDiv.className = 'message-container success-message';
    successDiv.style.backgroundColor = '#dff0d8';
    successDiv.style.color = '#3c763d';
    successDiv.style.padding = '15px';
    successDiv.style.margin = '20px 0';
    successDiv.style.borderRadius = '4px';
    successDiv.style.textAlign = 'center';
    successDiv.style.direction = 'rtl';
    
    // إنشاء أيقونة النجاح
    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    iconSpan.style.marginLeft = '10px';
    iconSpan.style.verticalAlign = 'middle';
    
    // إنشاء نص النجاح
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    textSpan.style.verticalAlign = 'middle';
    
    // إضافة العناصر
    successDiv.appendChild(iconSpan);
    successDiv.appendChild(textSpan);
    
    // إدراج الرسالة قبل العنصر الأول من النموذج
    form.parentNode.insertBefore(successDiv, form);
    
    // التمرير إلى الرسالة
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // إزالة الرسالة بعد 5 ثوانٍ
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 5000);
}

/**
 * عرض رسالة خطأ عند فشل إرسال النموذج
 * @param {HTMLFormElement} form - عنصر النموذج
 * @param {string} errorMessage - رسالة الخطأ للعرض
 */
function showErrorMessage(form, errorMessage) {
    // إزالة أي رسائل موجودة
    removeMessages(form);
    
    // إنشاء حاوية رسالة الخطأ
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message-container error-message';
    errorDiv.style.backgroundColor = '#f2dede';
    errorDiv.style.color = '#a94442';
    errorDiv.style.padding = '15px';
    errorDiv.style.margin = '20px 0';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.direction = 'rtl';
    
    // إنشاء أيقونة الخطأ
    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    iconSpan.style.marginLeft = '10px';
    iconSpan.style.verticalAlign = 'middle';
    
    // إنشاء نص الخطأ
    const textSpan = document.createElement('span');
    textSpan.textContent = errorMessage || 'حدث خطأ في إرسال النموذج. الرجاء المحاولة مرة أخرى.';
    textSpan.style.verticalAlign = 'middle';
    
    // إضافة العناصر
    errorDiv.appendChild(iconSpan);
    errorDiv.appendChild(textSpan);
    
    // إدراج الرسالة قبل العنصر الأول من النموذج
    form.parentNode.insertBefore(errorDiv, form);
    
    // التمرير إلى الرسالة
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // إزالة الرسالة بعد 5 ثوانٍ
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

/**
 * إزالة أي حاويات رسائل موجودة
 * @param {HTMLFormElement} form - عنصر النموذج
 */
function removeMessages(form) {
    // البحث عن جميع حاويات الرسائل في الأب
    const parent = form.parentNode;
    const messages = parent.querySelectorAll('.message-container');
    
    // إزالة كل رسالة
    messages.forEach(message => {
        parent.removeChild(message);
    });
}