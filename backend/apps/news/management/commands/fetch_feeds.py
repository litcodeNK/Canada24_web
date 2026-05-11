from django.core.management.base import BaseCommand

from apps.news.services import fetch_all_feeds
from apps.news.services_external import fetch_gnews_canada, fetch_newsapi_canada
from apps.news.services_videos import fetch_official_news_videos


class Command(BaseCommand):
    help = "Fetch RSS feeds + NewsAPI + GNews and upsert articles into the database."

    def add_arguments(self, parser):
        parser.add_argument("--rss-only", action="store_true", help="Skip external API fetches")
        parser.add_argument("--api-only", action="store_true", help="Skip RSS feed fetches")
        parser.add_argument("--include-videos", action="store_true", help="Also seed official news videos")
        parser.add_argument("--videos-only", action="store_true", help="Seed only official news videos")

    def handle(self, *args, **options):
        rss_only = options.get("rss_only")
        api_only = options.get("api_only")
        include_videos = options.get("include_videos")
        videos_only = options.get("videos_only")

        if videos_only:
            self.stdout.write("=== Official news videos ===")
            for item in fetch_official_news_videos():
                self.stdout.write(str(item))
            return

        if not api_only:
            self.stdout.write("=== RSS feeds ===")
            for item in fetch_all_feeds():
                self.stdout.write(str(item))

        if not rss_only:
            self.stdout.write("=== NewsAPI ===")
            for item in fetch_newsapi_canada():
                self.stdout.write(str(item))

            self.stdout.write("=== GNews ===")
            for item in fetch_gnews_canada():
                self.stdout.write(str(item))

        if include_videos:
            self.stdout.write("=== Official news videos ===")
            for item in fetch_official_news_videos():
                self.stdout.write(str(item))
