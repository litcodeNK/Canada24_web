import os

from celery import Celery

default_settings_module = (
    "config.settings.production"
    if any(key.startswith("RAILWAY_") for key in os.environ)
    else "config.settings.development"
)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", default_settings_module)

app = Celery("canada247")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
