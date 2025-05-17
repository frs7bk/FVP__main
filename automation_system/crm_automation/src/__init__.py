"""
حزمة نظام متابعة العملاء المحتملين

هذه الحزمة تحتوي على الوحدات الرئيسية لنظام أتمتة متابعة العملاء المحتملين.
"""

__version__ = "1.0.0"
__author__ = "فريق التطوير"
__email__ = "dev@example.com"

# تصدير الوحدات الرئيسية
from .config import settings
from .database import init_db, get_db, Lead, Interaction, Task
from .followup_manager import FollowUpManager, process_follow_ups
from .email_service import EmailService, email_service
from .ai_services import ai_service

# تصدير الإصدار
__all__ = [
    'settings',
    'init_db',
    'get_db',
    'Lead',
    'Interaction',
    'Task',
    'FollowUpManager',
    'process_follow_ups',
    'EmailService',
    'email_service',
    'ai_service'
]
