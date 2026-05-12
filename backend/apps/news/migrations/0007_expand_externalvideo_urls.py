from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0006_externalvideo"),
    ]

    operations = [
        migrations.AlterField(
            model_name="externalvideo",
            name="source_url",
            field=models.URLField(max_length=1000),
        ),
        migrations.AlterField(
            model_name="externalvideo",
            name="thumbnail_url",
            field=models.URLField(blank=True, max_length=1000),
        ),
    ]
