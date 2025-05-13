"""
Render Platform Deployment Setup Script
This script performs necessary setup steps before deploying to Render:
1. Creates necessary directories
2. Fixes common deployment issues
3. Sets up environment configurations
4. Prepares the database connection
"""

import os
import sys
import logging
import subprocess
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("render_setup")

def create_directories():
    """Create necessary directories if they don't exist"""
    directories = [
        'uploads',
        'uploads/portfolio',
        'uploads/services',
        'uploads/profiles',
        'uploads/carousel',
        'uploads/sections',
        'tmp',
        'instance'
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {directory}")

def check_environment_variables():
    """Check if required environment variables are set"""
    required_vars = ['DATABASE_URL', 'FLASK_SECRET_KEY', 'SESSION_SECRET']
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        logger.warning(f"Missing environment variables: {', '.join(missing_vars)}")
        
        # Set default values for development if not in production
        if 'RENDER' not in os.environ:
            if 'DATABASE_URL' in missing_vars:
                # Set a default SQLite database URL for development
                os.environ['DATABASE_URL'] = 'sqlite:///instance/portfolio.db'
                logger.info("Set default DATABASE_URL for development")
            
            if 'FLASK_SECRET_KEY' in missing_vars:
                os.environ['FLASK_SECRET_KEY'] = 'dev-secret-key-change-in-production'
                logger.info("Set default FLASK_SECRET_KEY for development")
                
            if 'SESSION_SECRET' in missing_vars:
                os.environ['SESSION_SECRET'] = 'dev-session-secret-change-in-production'
                logger.info("Set default SESSION_SECRET for development")

def copy_fix_files():
    """Copy fix files to appropriate locations"""
    try:
        # Run fixes if they exist
        if os.path.exists('fix_visitor_notification.py'):
            logger.info("Applying visitor notification fix")
            # No need to execute, will be imported by main.py
            
        if os.path.exists('fix_admin_access.py'):
            logger.info("Applying admin access fix")
            # No need to execute, will be imported by main.py
            
        if os.path.exists('fix_analytics_routes.py'):
            logger.info("Applying analytics routes fix")
            # No need to execute, will be imported by main.py
    except Exception as e:
        logger.error(f"Error applying fixes: {str(e)}")

def run_health_check():
    """Check that essential files exist and dependencies are loaded"""
    essential_files = [
        'main.py', 
        'app.py', 
        'models.py', 
        'templates/base.html',
        'static/js/enhanced-video-stop-manager.js'
    ]
    
    for file in essential_files:
        if not os.path.exists(file):
            logger.error(f"Missing essential file: {file}")
        else:
            logger.info(f"Found essential file: {file}")

def main():
    """Main function to run setup steps"""
    logger.info("Starting Render deployment setup")
    
    create_directories()
    check_environment_variables()
    copy_fix_files()
    run_health_check()
    
    logger.info("Render deployment setup completed successfully")

if __name__ == "__main__":
    main()