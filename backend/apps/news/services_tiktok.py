from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode, urlparse, urlunparse

import requests
from django.conf import settings

from .models import CuratedTikTokLink, ExternalVideo, TikTokCredential

USER_AGENT = "Canada247Bot/1.0 (+https://canada247.local)"
TIKTOK_OEMBED_URL = "https://www.tiktok.com/oembed"
TIKTOK_AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/"
TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
TIKTOK_VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/"
TIKTOK_USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/"
TIKTOK_SCOPES = "user.info.basic,video.list"
CURATED_TIKTOK_VIDEOS = [
    {"url": "https://www.tiktok.com/@canada247.ca/video/7625458244944727317"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7628162175269408020"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7627599799319153940"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7638720241291250964"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7638417231721909525"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7637703589372136725"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7634971843341995284"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7632822338748189972"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7632104104298384660"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7632090655833066772"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7628469891992997140"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7628159461823204629"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7627640063408540949"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7627593876164971796"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7627587328118131988"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7626962562222951700"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7626535117212650773"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7625939447942696213"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7625779373727091989"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7625098525319138581"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7624802702756728085"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7624757119778098453"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7624229526721023252"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7623992540416593173"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7623959038220406036"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7623953256594607381"},
    {"url": "https://www.tiktok.com/@canada247.ca/video/7612338573769067797"},
]


def _parse_tiktok_video(url: str) -> tuple[str | None, str]:
    parsed = urlparse(url)
    path_parts = [part for part in parsed.path.split("/") if part]
    if len(path_parts) < 3 or path_parts[1] != "video":
        return None, ""
    username = path_parts[0].lstrip("@")
    video_id = path_parts[2]
    return video_id or None, username


def _fallback_title(username: str) -> str:
    return f"TikTok video from @{username}" if username else "TikTok video"


def _canonicalize_url(url: str) -> str:
    parsed = urlparse(url.strip())
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", ""))


def _fetch_oembed(url: str) -> dict:
    try:
        response = requests.get(
            TIKTOK_OEMBED_URL,
            params={"url": url},
            timeout=20,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        )
        response.raise_for_status()
        payload = response.json()
        return payload if isinstance(payload, dict) else {}
    except Exception:
        return {}


def fetch_curated_tiktok_videos() -> list[dict]:
    summary = []

    admin_added_urls = [{"url": url} for url in CuratedTikTokLink.objects.values_list("url", flat=True)]

    for item in CURATED_TIKTOK_VIDEOS + admin_added_urls:
        source_url = _canonicalize_url(item["url"])
        video_id, username = _parse_tiktok_video(source_url)
        if not video_id:
            summary.append({"feed_key": "tiktok-curated", "url": source_url, "error": "Invalid TikTok URL"})
            continue

        oembed = _fetch_oembed(source_url)
        title = str(oembed.get("title") or "").strip()[:255] or _fallback_title(username)
        channel_name = str(oembed.get("author_name") or "").strip()[:255] or username[:255]
        thumbnail_url = str(oembed.get("thumbnail_url") or "").strip()

        defaults = {
            "title": title,
            "description": "",
            "thumbnail_url": thumbnail_url,
            "source_url": source_url,
            "channel_name": channel_name,
            "published_at": datetime.now(tz=timezone.utc),
            "is_live": False,
            "is_published": True,
        }

        video, created = ExternalVideo.objects.get_or_create(
            external_id=f"tiktok:{video_id}",
            defaults=defaults,
        )

        if created:
            summary.append({"feed_key": "tiktok-curated", "created": 1, "updated": 0, "external_id": video.external_id})
            continue

        update_fields = []
        for field, value in defaults.items():
            if field == "published_at":
                continue
            if getattr(video, field) != value and value:
                setattr(video, field, value)
                update_fields.append(field)
        if update_fields:
            video.save(update_fields=update_fields)
        summary.append(
            {
                "feed_key": "tiktok-curated",
                "created": 0,
                "updated": int(bool(update_fields)),
                "external_id": video.external_id,
            }
        )

    return summary


# --- Official Display API: connected-account OAuth + video sync -----------------


def get_tiktok_authorize_url(redirect_uri: str, state: str) -> str:
    params = {
        "client_key": settings.TIKTOK_CLIENT_KEY,
        "scope": TIKTOK_SCOPES,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "state": state,
    }
    return f"{TIKTOK_AUTHORIZE_URL}?{urlencode(params)}"


def _store_token_response(payload: dict) -> TikTokCredential:
    now = datetime.now(tz=timezone.utc)
    access_expires_at = now + timedelta(seconds=int(payload["expires_in"]))
    refresh_expires_at = now + timedelta(seconds=int(payload["refresh_expires_in"]))

    account_username = ""
    open_id = str(payload.get("open_id", ""))
    if open_id:
        account_username = _fetch_account_display_name(payload["access_token"]) or ""

    credential, _ = TikTokCredential.objects.update_or_create(
        defaults={
            "account_username": account_username,
            "open_id": open_id,
            "access_token": payload["access_token"],
            "refresh_token": payload["refresh_token"],
            "access_token_expires_at": access_expires_at,
            "refresh_token_expires_at": refresh_expires_at,
        }
    )
    return credential


def exchange_tiktok_code_for_token(code: str, redirect_uri: str) -> TikTokCredential:
    response = requests.post(
        TIKTOK_TOKEN_URL,
        data={
            "client_key": settings.TIKTOK_CLIENT_KEY,
            "client_secret": settings.TIKTOK_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    if "access_token" not in payload:
        raise ValueError(f"TikTok token exchange failed: {payload}")
    return _store_token_response(payload)


def _refresh_tiktok_token(credential: TikTokCredential) -> TikTokCredential:
    response = requests.post(
        TIKTOK_TOKEN_URL,
        data={
            "client_key": settings.TIKTOK_CLIENT_KEY,
            "client_secret": settings.TIKTOK_CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": credential.refresh_token,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    if "access_token" not in payload:
        raise ValueError(f"TikTok token refresh failed: {payload}")
    return _store_token_response(payload)


def _fetch_account_display_name(access_token: str) -> str:
    try:
        response = requests.get(
            TIKTOK_USER_INFO_URL,
            params={"fields": "display_name"},
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15,
        )
        response.raise_for_status()
        return str(response.json().get("data", {}).get("user", {}).get("display_name", ""))
    except Exception:
        return ""


def get_valid_credential() -> TikTokCredential | None:
    """Returns a TikTok credential with a non-expired access token, refreshing if needed."""
    credential = TikTokCredential.objects.order_by("-updated_at").first()
    if credential is None:
        return None

    now = datetime.now(tz=timezone.utc)
    # Refresh a little early so a slow request never straddles the real expiry.
    if credential.access_token_expires_at <= now + timedelta(minutes=5):
        credential = _refresh_tiktok_token(credential)
    return credential


def fetch_account_tiktok_videos(max_count: int = 20) -> list[dict]:
    """Pulls recent videos from the connected @canada247.ca account via the Display API."""
    credential = get_valid_credential()
    if credential is None:
        return [{"feed_key": "tiktok-account", "error": "No TikTok account connected yet"}]

    try:
        response = requests.post(
            TIKTOK_VIDEO_LIST_URL,
            params={"fields": "id,title,video_description,cover_image_url,share_url,create_time"},
            json={"max_count": max_count},
            headers={
                "Authorization": f"Bearer {credential.access_token}",
                "Content-Type": "application/json",
            },
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
    except Exception as exc:
        return [{"feed_key": "tiktok-account", "error": str(exc)}]

    videos = payload.get("data", {}).get("videos", [])
    summary = []
    for item in videos:
        video_id = str(item.get("id", ""))
        if not video_id:
            continue

        title = str(item.get("title") or item.get("video_description") or "").strip()[:255]
        title = title or _fallback_title(credential.account_username)
        create_time = item.get("create_time")
        published_at = (
            datetime.fromtimestamp(int(create_time), tz=timezone.utc) if create_time else datetime.now(tz=timezone.utc)
        )

        defaults = {
            "title": title,
            "description": str(item.get("video_description") or "")[:2000],
            "thumbnail_url": str(item.get("cover_image_url") or ""),
            "source_url": str(item.get("share_url") or ""),
            "channel_name": credential.account_username or "canada247.ca",
            "published_at": published_at,
            "is_live": False,
            "is_published": True,
        }

        video, created = ExternalVideo.objects.get_or_create(
            external_id=f"tiktok:{video_id}",
            defaults=defaults,
        )

        if created:
            summary.append({"feed_key": "tiktok-account", "created": 1, "updated": 0, "external_id": video.external_id})
            continue

        update_fields = []
        for field, value in defaults.items():
            if field == "published_at":
                continue
            if getattr(video, field) != value and value:
                setattr(video, field, value)
                update_fields.append(field)
        if update_fields:
            video.save(update_fields=update_fields)
        summary.append(
            {
                "feed_key": "tiktok-account",
                "created": 0,
                "updated": int(bool(update_fields)),
                "external_id": video.external_id,
            }
        )

    return summary
