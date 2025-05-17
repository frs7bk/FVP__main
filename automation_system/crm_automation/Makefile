.PHONY: install test lint format clean run-docker stop-docker migrate upgrade-db

# تثبيت التبعيات
install:
	pip install -r requirements.txt

# تشغيل الاختبارات
test:
	pytest tests/ -v

# فحص جودة الكود
lint:
	black --check .
	isort --check-only .
	mypy .

# تنسيق الكود
format:
	black .
	isort .

# تنظيف الملفات المؤقتة
clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	find . -type d -name ".mypy_cache" -exec rm -r {} +
	find . -name "*.pyc" -delete
	find . -name "*.pyo" -delete
	find . -name "*~" -delete

# تشغيل التطبيق باستخدام Docker
run-docker:
	docker-compose up -d --build

# إيقاف التطبيق
stop-docker:
	docker-compose down

# إنشاء ترحيلات قاعدة البيانات
migrate:
	docker-compose exec app alembic revision --autogenerate -m "$(m)"

# تطبيق ترحيلات قاعدة البيانات
upgrade-db:
	docker-compose exec app alembic upgrade head

# تشغيل shell داخل الحاوية
shell:
	docker-compose exec app bash

# تشغيل الاختبارات مع تغطية الشفرة
test-cov:
	pytest --cov=src tests/ --cov-report=term-missing

# إنشاء متطلبات التطوير
freeze:
	pip freeze > requirements.txt

# مساعدة
help:
	@echo "الأوامر المتاحة:"
	@echo "  install     - تثبيت التبعيات"
	@echo "  test        - تشغيل الاختبارات"
	@echo "  lint        - فحص جودة الكود"
	@echo "  format      - تنسيق الكود"
	@echo "  clean       - تنظيف الملفات المؤقتة"
	@echo "  run-docker  - تشغيل التطبيق باستخدام Docker"
	@echo "  stop-docker - إيقاف التطبيق"
	@echo "  migrate     - إنشاء ترحيلات قاعدة البيانات"
	@echo "  upgrade-db  - تطبيق ترحيلات قاعدة البيانات"
	@echo "  shell       - فتح shell داخل الحاوية"
	@echo "  test-cov    - تشغيل الاختبارات مع تغطية الشفرة"
	@echo "  freeze      - تحديث ملف المتطلبات"

# الهدف الافتراضي
.DEFAULT_GOAL := help
