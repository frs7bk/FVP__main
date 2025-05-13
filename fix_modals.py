"""
إصلاح إضافي للنوافذ المنبثقة في معرض الأعمال
هذا الملف ينشئ مسارًا إضافيًا لإصلاح مشكلة النوافذ المنبثقة
"""

from flask import Blueprint, send_from_directory, render_template, jsonify, request, url_for
import os

fix_modals_bp = Blueprint('fix_modals', __name__)


@fix_modals_bp.route('/portfolio/modal_scripts', methods=['GET'])
def get_modal_scripts():
    """
    إرجاع ملفات JavaScript الخاصة بإصلاح النوافذ المنبثقة
    """
    # لوجود تصحيح مسار القالب
    return jsonify({
        'status': 'success',
        'message': 'Modal fix scripts are ready',
        'scripts': [
            url_for('static', filename='js/load-portfolio-modal.js'),
            url_for('static', filename='js/portfolio-modal-fix.js')
        ]
    })


@fix_modals_bp.route('/portfolio/modal_templates', methods=['GET'])
def get_modal_template():
    """
    إرجاع قالب النافذة المنبثقة
    """
    # لوجود تصحيح مسار القالب بالكامل كـ HTML
    modal_html = """
    <!-- مودال تفاصيل المشروع -->
    <div id="portfolio-modal" class="portfolio-modal">
      <button id="close-modal" class="close-modal">&times;</button>
      
      <div class="modal-container">
        <!-- قسم الصورة أو الفيديو -->
        <div class="modal-media">
          <!-- صورة المشروع (تظهر افتراضياً) -->
          <div id="modal-image-container" class="modal-image">
            <img id="modal-image" src="" alt="صورة المشروع">
          </div>
          
          <!-- فيديو المشروع (يظهر إذا كان متاحاً) -->
          <div id="modal-video-container" class="modal-video" style="display: none;">
            <!-- فيديو محلي -->
            <div id="modal-local-video-container" style="display: none;">
              <video id="modal-local-video" controls class="w-100">
                <source id="modal-video-source" src="" type="video/mp4">
                لا يدعم متصفحك تشغيل الفيديو.
              </video>
            </div>
            
            <!-- فيديو خارجي (يوتيوب/فيميو) -->
            <div id="modal-external-video-container" style="display: none;">
              <iframe id="modal-external-video" frameborder="0" allowfullscreen class="w-100"></iframe>
            </div>
            
            <!-- زر الرجوع إلى الصورة -->
            <div class="text-center mt-2">
              <button id="back-to-image-btn" class="btn btn-light back-to-image-btn">
                <i class="fas fa-image me-1"></i> العودة للصورة
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-content">
          <div class="modal-header">
            <img src="/static/uploads/profile.png" alt="صورة الملف الشخصي">
            <h4>فيراس ديزاين</h4>
          </div>
          
          <div class="modal-details">
            <h3 id="modal-title"></h3>
            <span id="modal-category" class="modal-category"></span>
            <div id="modal-description"></div>
            <div id="modal-link-container" style="display: none;">
              <a id="modal-link" href="#" target="_blank" class="btn btn-primary mt-2">زيارة المشروع</a>
            </div>
            
            <!-- زر عرض الفيديو (يظهر فقط إذا كان هناك فيديو) -->
            <div id="modal-video-button-container" style="display: none;" class="mt-3 modal-video-section">
              <button id="show-video-btn" class="btn btn-success btn-lg" onclick="showVideo()">
                <i class="fas fa-play-circle me-2"></i> عرض فيديو المشروع
              </button>
            </div>
            
            <div class="modal-meta">
              <span id="modal-date"></span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button id="like-button" type="button"><i class="far fa-heart"></i></button>
            <button id="show-video-btn-inline" class="video-btn-inline" onclick="showVideo()" style="display: none;">
              <i class="fas fa-play-circle"></i> عرض الفيديو
            </button>
            <button type="button"><i class="far fa-share-square"></i></button>
          </div>
          
          <!-- زر عرض الفيديو منفصل (يظهر فقط عند وجود فيديو) -->
          <div id="video-action-btn" class="video-action-container" style="display: none;">
            <button onclick="showVideo()" class="video-action-button">
              <i class="fas fa-play-circle"></i> مشاهدة الفيديو
            </button>
          </div>
          
          <div class="modal-stats">
            <p id="modal-likes">0 إعجاب</p>
            <p id="modal-views">0 مشاهدة</p>
          </div>
          
          <input type="hidden" id="modal-item-id" value="">
          <!-- حقول مخفية لتخزين بيانات الفيديو -->
          <input type="hidden" id="modal-has-video" value="0">
          <input type="hidden" id="modal-video-type" value="">
          <input type="hidden" id="modal-video-url" value="">
          <input type="hidden" id="modal-video-file" value="">
        </div>
      </div>
    </div>
    <!-- إضافة CSS للفيديو في النافذة المنبثقة -->
    <style>
    .modal-media {
      position: relative;
      width: 100%;
      max-height: 70vh;
      overflow: hidden;
    }

    .modal-video {
      width: 100%;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }

    #modal-local-video,
    #modal-external-video {
      width: 100%;
      max-height: 70vh;
      height: 450px;
    }

    .media-toggle-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
      opacity: 0.7;
      transition: opacity 0.3s;
    }

    .media-toggle-btn:hover {
      opacity: 1;
    }

    /* CSS للزر الخاص بعرض الفيديو */
    .modal-video-section {
      text-align: center;
      margin: 20px 0;
    }

    #show-video-btn {
      display: inline-block;
      padding: 10px 20px;
      font-size: 18px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      font-weight: bold;
      animation: pulse 2s infinite;
      width: auto;
      margin: 10px auto;
    }

    #show-video-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }

    /* تصميم زر الفيديو في شريط الأزرار */
    #show-video-btn-inline {
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      margin-right: 5px;
      margin-left: 5px;
      padding: 8px 12px;
      transition: all 0.3s ease;
      animation: glow 1.5s infinite alternate;
    }

    #show-video-btn-inline i {
      font-size: 18px;
    }

    #show-video-btn-inline:hover {
      transform: scale(1.1);
      background-color: #218838;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
      }
    }

    @keyframes glow {
      from {
        box-shadow: 0 0 5px rgba(40, 167, 69, 0.5);
      }
      to {
        box-shadow: 0 0 15px rgba(40, 167, 69, 0.8);
      }
    }

    /* تصميم زر مشاهدة الفيديو المنفصل */
    .video-action-container {
      text-align: center;
      margin: 15px 0;
      animation: pulse-opacity 2s infinite;
    }

    .video-action-button {
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 30px;
      padding: 10px 25px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .video-action-button i {
      font-size: 20px;
      margin-right: 8px;
    }

    .video-action-button:hover {
      background-color: #218838;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(40, 167, 69, 0.4);
    }

    @keyframes pulse-opacity {
      0% {
        opacity: 0.9;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.9;
      }
    }

    /* تصميم زر الفيديو في شريط الأزرار - الشكل الجديد */
    .video-btn-inline {
      background-color: #28a745 !important;
      color: white !important;
      border: none !important;
      border-radius: 8px !important;
      margin: 0 10px !important;
      padding: 8px 15px !important;
      transition: all 0.3s ease !important;
      animation: pulse 2s infinite !important;
      font-weight: bold !important;
      font-size: 14px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 5px !important;
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3) !important;
    }

    .video-btn-inline i {
      font-size: 18px !important;
    }

    .video-btn-inline:hover {
      transform: translateY(-2px) !important;
      background-color: #218838 !important;
      box-shadow: 0 6px 12px rgba(40, 167, 69, 0.5) !important;
    }
    </style>
    """
    
    return jsonify({
        'status': 'success',
        'html': modal_html
    })


def init_fix_modals(app):
    """
    تهيئة مسارات إصلاح النوافذ المنبثقة
    """
    app.register_blueprint(fix_modals_bp)
    
    return app