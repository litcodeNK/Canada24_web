import secrets

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import redirect

from .services_tiktok import exchange_tiktok_code_for_token, get_tiktok_authorize_url


@staff_member_required
def tiktok_oauth_start(request):
    """Redirects a logged-in Django admin to TikTok's consent screen.

    The state token is round-tripped through the session so the callback can
    confirm the response actually belongs to this browser's login, not a
    forged redirect.
    """
    state = secrets.token_urlsafe(24)
    request.session["tiktok_oauth_state"] = state
    return redirect(get_tiktok_authorize_url(settings.TIKTOK_REDIRECT_URI, state))


@staff_member_required
def tiktok_oauth_callback(request):
    error = request.GET.get("error")
    if error:
        return HttpResponseBadRequest(f"TikTok denied the connection: {error}")

    state = request.GET.get("state")
    expected_state = request.session.pop("tiktok_oauth_state", None)
    if not state or state != expected_state:
        return HttpResponseBadRequest(
            "Invalid or expired OAuth state — start the connection again from /admin/."
        )

    code = request.GET.get("code")
    if not code:
        return HttpResponseBadRequest("Missing authorization code from TikTok.")

    credential = exchange_tiktok_code_for_token(code, settings.TIKTOK_REDIRECT_URI)
    return HttpResponse(
        f"<h2>TikTok account connected: {credential.account_username or credential.open_id}</h2>"
        "<p>You can close this tab. New videos will sync automatically going forward.</p>"
    )
