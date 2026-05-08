from django.db import migrations

REGION_URL_UPDATES = [
    {"slug": "calgary",           "rss_url": "https://globalnews.ca/calgary/feed/"},
    {"slug": "edmonton",          "rss_url": "https://globalnews.ca/edmonton/feed/"},
    {"slug": "winnipeg",          "rss_url": "https://globalnews.ca/winnipeg/feed/"},
    {"slug": "kitchener-waterloo","rss_url": "https://globalnews.ca/kitchener/feed/"},
    {"slug": "toronto",           "rss_url": "https://globalnews.ca/toronto/feed/"},
    {"slug": "vancouver",         "rss_url": "https://globalnews.ca/bc/feed/"},
    {"slug": "montreal",          "rss_url": "https://globalnews.ca/montreal/feed/"},
    {"slug": "ottawa",            "rss_url": "https://globalnews.ca/ottawa/feed/"},
    {"slug": "halifax",           "rss_url": "https://globalnews.ca/halifax/feed/"},
    {"slug": "regina",            "rss_url": "https://globalnews.ca/regina/feed/"},
    {"slug": "saskatoon",         "rss_url": "https://globalnews.ca/saskatoon/feed/"},
    {"slug": "victoria",          "rss_url": "https://www.timescolonist.com/feed/"},
]


def update_region_urls(apps, schema_editor):
    Region = apps.get_model("regions", "Region")
    for update in REGION_URL_UPDATES:
        Region.objects.filter(slug=update["slug"]).update(rss_url=update["rss_url"])


def revert_region_urls(apps, schema_editor):
    CBC_URLS = {
        "calgary":            "https://www.cbc.ca/webfeed/rss/rss-canada-calgary",
        "edmonton":           "https://www.cbc.ca/webfeed/rss/rss-canada-edmonton",
        "winnipeg":           "https://www.cbc.ca/webfeed/rss/rss-canada-manitoba",
        "kitchener-waterloo": "https://www.cbc.ca/webfeed/rss/rss-canada-kitchenerwaterloo",
        "toronto":            "https://www.cbc.ca/webfeed/rss/rss-canada-toronto",
        "vancouver":          "https://www.cbc.ca/webfeed/rss/rss-canada-britishcolumbia",
        "montreal":           "https://www.cbc.ca/webfeed/rss/rss-canada-montreal",
        "ottawa":             "https://www.cbc.ca/webfeed/rss/rss-canada-ottawa",
        "halifax":            "https://www.cbc.ca/webfeed/rss/rss-canada-novascotia",
        "regina":             "https://www.cbc.ca/webfeed/rss/rss-canada-saskatchewan",
        "saskatoon":          "https://www.cbc.ca/webfeed/rss/rss-canada-saskatchewan",
        "victoria":           "https://www.cbc.ca/webfeed/rss/rss-canada-britishcolumbia",
    }
    Region = apps.get_model("regions", "Region")
    for slug, url in CBC_URLS.items():
        Region.objects.filter(slug=slug).update(rss_url=url)


class Migration(migrations.Migration):
    dependencies = [("regions", "0002_seed_regions")]

    operations = [migrations.RunPython(update_region_urls, revert_region_urls)]
