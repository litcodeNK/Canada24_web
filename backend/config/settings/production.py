from decouple import config

from .base import *

DEBUG = False

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="",
    cast=lambda value: [item.strip() for item in value.split(",") if item.strip()],
)
if "healthcheck.railway.app" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append("healthcheck.railway.app")
RAILWAY_PUBLIC_DOMAIN = config("RAILWAY_PUBLIC_DOMAIN", default="")
if RAILWAY_PUBLIC_DOMAIN and RAILWAY_PUBLIC_DOMAIN not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RAILWAY_PUBLIC_DOMAIN)

# WhiteNoise — serve static files directly from gunicorn
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Security headers
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Database — Railway provides DATABASE_URL
import dj_database_url  # type: ignore
DATABASE_URL = (
    config("DATABASE_URL", default="")
    or config("DATABASE_PRIVATE_URL", default="")
    or config("DATABASE_PUBLIC_URL", default="")
)
if DATABASE_URL:
    DATABASES["default"] = dj_database_url.config(
        default=DATABASE_URL, conn_max_age=600, ssl_require=True
    )
else:
    PGHOST = config("PGHOST", default="")
    PGDATABASE = config("PGDATABASE", default="")
    if PGHOST and PGDATABASE:
        DATABASES["default"] = {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": PGDATABASE,
            "USER": config("PGUSER", default="postgres"),
            "PASSWORD": config("PGPASSWORD", default=""),
            "HOST": PGHOST,
            "PORT": config("PGPORT", default="5432"),
        }
