"""
وحدة خدمات الذكاء الاصطناعي
"""
import logging
from typing import Dict, Any, List, Optional, Tuple
import openai
from transformers import pipeline
from .config import settings

# إعداد التسجيل
logger = logging.getLogger(__name__)

class AIService:
    """فئة الخدمات الذكاء الاصطناعي"""
    
    def __init__(self):
        """تهيئة خدمة الذكاء الاصطناعي"""
        self.sentiment_analyzer = None
        self.openai_client = None
        self._initialize_services()
    
    def _initialize_services(self):
        """تهيئة خدمات الذكاء الاصطناعي"""
        try:
            # تهيئة محلل المشاعر
            if settings.ENABLE_SENTIMENT_ANALYSIS:
                self.sentiment_analyzer = pipeline(
                    "sentiment-analysis",
                    model=settings.SENTIMENT_ANALYSIS_MODEL
                )
                logger.info("تم تهيئة محلل المشاعر بنجاح")
            
            # تهيئة OpenAI إذا كان المفتاح متوفراً
            if settings.OPENAI_API_KEY:
                openai.api_key = settings.OPENAI_API_KEY
                self.openai_client = openai.OpenAI()
                logger.info("تم تهيئة خدمة OpenAI بنجاح")
                
        except Exception as e:
            logger.error(f"فشل تهيئة خدمات الذكاء الاصطناعي: {str(e)}")
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """تحليل مشاعر النص"""
        if not text or not self.sentiment_analyzer:
            return {"label": "neutral", "score": 0.0}
        
        try:
            result = self.sentiment_analyzer(text)[0]
            return {
                "label": result["label"].lower(),
                "score": result["score"]
            }
        except Exception as e:
            logger.error(f"فشل تحليل المشاعر: {str(e)}")
            return {"label": "error", "score": 0.0, "error": str(e)}
    
    def generate_followup_suggestion(self, lead_info: Dict[str, Any], interaction_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """إنشاء اقتراحات متابعة مخصصة باستخدام الذكاء الاصطناعي"""
        if not self.openai_client or not settings.ENABLE_AI_SUGGESTIONS:
            return {
                "suggestion": "اتصل بالعميل للتحقق من احتياجاته وتقديم المساعدة.",
                "priority": "medium"
            }
        
        try:
            # بناء سياق المحادثة
            context = f"""
            العميل: {lead_info.get('first_name', '')} {lead_info.get('last_name', '')}
            الشركة: {lead_info.get('company', 'غير معروفة')}
            آخر تفاعل: {interaction_history[-1]['content'][:200] if interaction_history else 'لا يوجد سجل تفاعلات سابقة'}
            """
            
            # إعداد الرسالة للنموذج
            messages = [
                {"role": "system", "content": "أنت مساعد مبيعات محترف. قم باقتراح أفضل طريقة للمتابعة مع العميل بناءً على سجل التفاعلات."},
                {"role": "user", "content": f"{context}\n\nما هي أفضل طريقة للمتابعة مع هذا العميل؟"}
            ]
            
            # استدعاء واجهة برمجة التطبيقات
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=200,
                temperature=0.7,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0
            )
            
            # تحليل الاستجابة
            suggestion = response.choices[0].message.content.strip()
            
            # تحديد الأولوية بناءً على المشاعر
            sentiment_scores = [i.get('sentiment_score', 0) for i in interaction_history if i.get('sentiment_score') is not None]
            avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
            
            if avg_sentiment > 0.3:
                priority = "high"
            elif avg_sentiment < -0.3:
                priority = "high"  # متابعة سريعة للعملاء غير الراضين
            else:
                priority = "medium"
            
            return {
                "suggestion": suggestion,
                "priority": priority,
                "sentiment_score": avg_sentiment
            }
            
        except Exception as e:
            logger.error(f"فشل إنشاء اقتراح متابعة: {str(e)}")
            return {
                "suggestion": "اتصل بالعميل للتحقق من احتياجاته وتقديم المساعدة.",
                "priority": "medium",
                "error": str(e)
            }

# إنشاء نسخة من الخدمة
ai_service = AIService()

# تصدير الخدمة
__all__ = ["ai_service"]
