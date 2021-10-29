from celery import Celery

celery_app = Celery("tasks", broker="redis://redis:6379/0")

celery_app.conf.task_routes = {"tasks.*": "main-queue"}
