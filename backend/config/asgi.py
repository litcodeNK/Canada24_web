import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application


def default_settings_module() -> str:
    return (
        "config.settings.production"
        if any(key.startswith("RAILWAY_") for key in os.environ)
        else "config.settings.development"
    )


os.environ.setdefault("DJANGO_SETTINGS_MODULE", default_settings_module())

django_asgi_app = get_asgi_application()

from config.routing import websocket_urlpatterns  # noqa: E402 — must import after Django setup

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
        ),
    }
)
