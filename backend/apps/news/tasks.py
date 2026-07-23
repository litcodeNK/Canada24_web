from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from config.celery_compat import shared_task

from .consumers import NewsFeedConsumer
from .serializers import ArticleSerializer
from .services import fetch_all_feeds, fetch_og_image
from .services_external import fetch_gnews_canada, fetch_newsapi_canada
from .services_tiktok import fetch_account_tiktok_videos, fetch_curated_tiktok_videos
from .services_videos import fetch_official_news_videos


@shared_task
def fetch_all_rss_feeds():
    summary = fetch_all_feeds()
    _broadcast_new_articles(summary)
    _trigger_push_notifications(summary)
    return summary


@shared_task
def fetch_external_news():
    """Pull Canadian headlines from NewsAPI.org and GNews.io (key-gated)."""
    newsapi_summary = fetch_newsapi_canada()
    gnews_summary = fetch_gnews_canada()
    combined = newsapi_summary + gnews_summary
    _broadcast_new_articles(combined)
    _trigger_push_notifications(combined)
    return combined


@shared_task
def fetch_videos():
    """Pull official news channel videos (CBC/CTV/Global), curated TikTok clips,
    and — once an account is connected via /admin/ — new videos posted to
    @canada247.ca's own TikTok automatically."""
    official_summary = fetch_official_news_videos()
    curated_tiktok_summary = fetch_curated_tiktok_videos()
    account_tiktok_summary = fetch_account_tiktok_videos()
    return official_summary + curated_tiktok_summary + account_tiktok_summary


@shared_task
def backfill_article_images(limit: int = 30):
    """Fill in missing thumbnails for articles whose RSS feed didn't include one.

    Several sources (APTN, CIC News, AVweb, National Post, University Affairs,
    MobileSyrup) publish no image data in their RSS feed at all, so the normal
    scrape leaves img_url blank. This looks up each article's own page instead
    and pulls its og:image/twitter:image meta tag as a fallback.
    """
    from .models import Article

    articles = list(
        Article.objects.filter(img_url="")
        .exclude(source_url="")
        .order_by("-published_at")[:limit]
    )

    updated_ids = []
    for article in articles:
        image_url = fetch_og_image(article.source_url)
        if image_url:
            article.img_url = image_url
            article.save(update_fields=["img_url"])
            updated_ids.append(article.pk)

    if updated_ids:
        _broadcast_updated_images(updated_ids)

    return {"checked": len(articles), "updated": len(updated_ids)}


def _broadcast_updated_images(article_ids: list[int]) -> None:
    from .models import Article
    from .querysets import annotate_article_queryset

    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    articles = Article.objects.prefetch_related("regions").filter(pk__in=article_ids)
    annotated = annotate_article_queryset(articles, user=None)
    data = ArticleSerializer(annotated, many=True).data

    for article in data:
        async_to_sync(channel_layer.group_send)(
            NewsFeedConsumer.GROUP_NAME,
            {"type": "news.article", "article": dict(article)},
        )


def _broadcast_new_articles(summary: list[dict]) -> None:
    """Push newly created articles to all connected WebSocket clients."""
    from .models import Article
    from .querysets import annotate_article_queryset

    created_ids = []
    for result in summary:
        created_ids.extend(result.get("created_ids", []))

    if not created_ids:
        return

    channel_layer = get_channel_layer()
    if channel_layer is None:
        return

    articles = (
        Article.objects.prefetch_related("regions")
        .filter(pk__in=created_ids)
        .order_by("-published_at")
    )
    annotated = annotate_article_queryset(articles, user=None)
    data = ArticleSerializer(annotated, many=True).data

    for article in data:
        async_to_sync(channel_layer.group_send)(
            NewsFeedConsumer.GROUP_NAME,
            {"type": "news.article", "article": dict(article)},
        )


def _trigger_push_notifications(summary: list[dict]) -> None:
    """Send Expo push notifications for breaking (is_live) new articles."""
    from .models import Article
    from apps.notifications.tasks import send_push_notifications

    all_created_ids = []
    for result in summary:
        all_created_ids.extend(result.get("created_ids", []))

    if not all_created_ids:
        return

    breaking = Article.objects.filter(pk__in=all_created_ids, is_live=True).values_list("pk", flat=True)
    for article_id in breaking:
        send_push_notifications.delay(article_id=article_id, preference_key="breaking_news")

    # Also notify "top_stories" subscribers once per fetch cycle if any new articles arrived
    if all_created_ids:
        first_id = all_created_ids[0]
        send_push_notifications.delay(article_id=first_id, preference_key="top_stories")
