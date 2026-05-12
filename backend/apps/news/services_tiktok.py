from datetime import datetime, timezone
from urllib.parse import urlparse, urlunparse

import requests

from .models import ExternalVideo

USER_AGENT = "Canada247Bot/1.0 (+https://canada247.local)"
TIKTOK_OEMBED_URL = "https://www.tiktok.com/oembed"
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

    for item in CURATED_TIKTOK_VIDEOS:
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
