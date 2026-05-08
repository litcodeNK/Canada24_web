from django.core.management.base import BaseCommand

from apps.news.services import fetch_all_feeds
from apps.news.services_external import fetch_gnews_canada, fetch_newsapi_canada


class Command(BaseCommand):
    help = "Fetch RSS feeds + NewsAPI + GNews and upsert articles into the database."

    def add_arguments(self, parser):
        parser.add_argument("--rss-only", action="store_true", help="Skip external API fetches")
        parser.add_argument("--api-only", action="store_true", help="Skip RSS feed fetches")

    def handle(self, *args, **options):
        rss_only = options.get("rss_only")
        api_only = options.get("api_only")

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
