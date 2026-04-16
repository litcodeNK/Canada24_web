from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

# Use console email backend in development (prints OTP to terminal)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Relaxed CORS in development
CORS_ALLOW_ALL_ORIGINS = True

# SQLite fallback for quick local dev (comment out to use Postgres)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }
