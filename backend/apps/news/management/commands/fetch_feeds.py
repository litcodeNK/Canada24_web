from django.core.management.base import BaseCommand

from apps.news.services import fetch_all_feeds


class Command(BaseCommand):
    help = "Fetch CBC RSS feeds and upsert articles into the local database."

    def handle(self, *args, **options):
        summary = fetch_all_feeds()
        for item in summary:
            self.stdout.write(str(item))
