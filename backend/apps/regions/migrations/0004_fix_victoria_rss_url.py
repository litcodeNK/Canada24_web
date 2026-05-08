from django.db import migrations


def fix_victoria(apps, schema_editor):
    Region = apps.get_model("regions", "Region")
    Region.objects.filter(slug="victoria").update(rss_url="https://www.cheknews.ca/feed/")


def revert_victoria(apps, schema_editor):
    Region = apps.get_model("regions", "Region")
    Region.objects.filter(slug="victoria").update(rss_url="https://www.timescolonist.com/feed/")


class Migration(migrations.Migration):
    dependencies = [("regions", "0003_update_region_rss_urls")]

    operations = [migrations.RunPython(fix_victoria, revert_victoria)]
