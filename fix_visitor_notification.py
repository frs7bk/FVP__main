
# Fix visitor notification format issue
# This file is called from main.py

import logging
from app import app
from flask import Flask

logger = logging.getLogger(__name__)

# Modern Flask app setup
def fix_visitor_notification():
    """Fix visitor notification format issues"""
    try:
        from telegram_service import format_visit_notification, send_new_visitor_notification
        from analytics import track_visitor
        
        # Modify visitor tracking function to match correct function
        original_track_visitor = track_visitor
        
        def fixed_track_visitor(request):
            visitor = original_track_visitor(request)
            if visitor:
                try:
                    # Call notification function with correct information only
                    ip = request.remote_addr
                    user_agent = request.headers.get('User-Agent', '')
                    # Make sure we pass only the parameters expected by the function
                    send_new_visitor_notification(visitor.id, ip, user_agent)
                except Exception as e:
                    logger.error(f"Error sending visitor notification: {str(e)}")
            return visitor
        
        # Replace original function with fixed function
        import analytics
        analytics.track_visitor = fixed_track_visitor
        
        logger.info("Fixed visitor notification format issues")
    except ImportError:
        logger.warning("Required modules for visitor notification fix not found")
    except Exception as e:
        logger.error(f"Error fixing visitor notifications: {str(e)}")

# Execute the fix immediately when imported
fix_visitor_notification()
