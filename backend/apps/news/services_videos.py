from datetime import datetime, timezone
from xml.etree import ElementTree as ET

import requests

from .models import ExternalVideo

ATOM_NAMESPACE = "{http://www.w3.org/2005/Atom}"
MEDIA_NAMESPACE = "{http://search.yahoo.com/mrss/}"
YOUTUBE_FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
USER_AGENT = "Canada247Bot/1.0 (+https://canada247.local)"

OFFICIAL_NEWS_VIDEO_CHANNELS = [
    {
        "channel_id": "UCuFFtHWoLl5fauMMD5Ww2jA",
        "channel_name": "CBC News",
    },
    {
        "channel_id": "UCi7Zk9baY1tvdlgxIML8MXg",
        "channel_name": "CTV News",
    },
    {
        "channel_id": "UChLtXXpo4Ge1ReTEboVvTDg",
        "channel_name": "Global News",
    },
]


def _text_or_blank(element) -> str:
    return (element.text or "").strip() if element is not None else ""


def _parse_published_at(value: str) -> datetime:
    if not value:
        return datetime.now(tz=timezone.utc)
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed
    except Exception:
        return datetime.now(tz=timezone.utc)


def _extract_entry(entry, fallback_channel_name: str) -> dict | None:
    video_id = _text_or_blank(entry.find(f"{YT_NAMESPACE}videoId"))
    title = _text_or_blank(entry.find(f"{ATOM_NAMESPACE}title"))
    if not video_id or not title:
        return None

    description = _text_or_blank(entry.find(f"{MEDIA_NAMESPACE}group/{MEDIA_NAMESPACE}description"))
    channel_name = (
        _text_or_blank(entry.find(f"{ATOM_NAMESPACE}author/{ATOM_NAMESPACE}name"))
        or fallback_channel_name
    )
    published_at = _parse_published_at(_text_or_blank(entry.find(f"{ATOM_NAMESPACE}published")))
    source_url = f"https://www.youtube.com/watch?v={video_id}"
    thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    is_live = "live" in title.lower() or "#live" in description.lower()

    return {
        "external_id": f"youtube:{video_id}",
        "title": title[:255],
        "description": description,
        "thumbnail_url": thumbnail_url,
        "source_url": source_url,
        "channel_name": channel_name[:255],
        "published_at": published_at,
        "is_live": is_live,
        "is_published": True,
    }


YT_NAMESPACE = "{http://www.youtube.com/xml/schemas/2015}"


def fetch_official_news_videos(limit_per_channel: int = 6) -> list[dict]:
    summary = []

    for channel in OFFICIAL_NEWS_VIDEO_CHANNELS:
        channel_id = channel["channel_id"]
        channel_name = channel["channel_name"]
        try:
            response = requests.get(
                YOUTUBE_FEED_URL.format(channel_id=channel_id),
                timeout=20,
                headers={"User-Agent": USER_AGENT, "Accept": "application/atom+xml, application/xml;q=0.9,*/*;q=0.8"},
            )
            response.raise_for_status()

            root = ET.fromstring(response.text)
            entries = []
            for entry in root.findall(f"{ATOM_NAMESPACE}entry")[:limit_per_channel]:
                mapped = _extract_entry(entry, channel_name)
                if mapped is not None:
                    entries.append(mapped)

            created_count = 0
            updated_count = 0
            for item in entries:
                video, created = ExternalVideo.objects.get_or_create(
                    external_id=item["external_id"],
                    defaults=item,
                )
                if created:
                    created_count += 1
                    continue

                update_fields = []
                for field, value in item.items():
                    if getattr(video, field) != value:
                        setattr(video, field, value)
                        update_fields.append(field)
                if update_fields:
                    video.save(update_fields=update_fields)
                    updated_count += 1

            summary.append(
                {
                    "feed_key": f"youtube-{channel_name.lower().replace(' ', '-')}",
                    "created": created_count,
                    "updated": updated_count,
                    "total": len(entries),
                }
            )
        except Exception as exc:
            summary.append(
                {
                    "feed_key": f"youtube-{channel_name.lower().replace(' ', '-')}",
                    "error": str(exc),
                }
            )

    return summary
