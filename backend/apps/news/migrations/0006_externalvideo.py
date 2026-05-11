from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("news", "0005_newsvideo_description"),
    ]

    operations = [
        migrations.CreateModel(
            name="ExternalVideo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("external_id", models.CharField(max_length=255, unique=True)),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("thumbnail_url", models.URLField(blank=True)),
                ("source_url", models.URLField()),
                ("channel_name", models.CharField(blank=True, max_length=255)),
                ("published_at", models.DateTimeField()),
                ("is_live", models.BooleanField(default=False)),
                ("is_published", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "external_videos",
                "ordering": ["-published_at", "-id"],
            },
        ),
        migrations.AddIndex(
            model_name="externalvideo",
            index=models.Index(fields=["-published_at"], name="external_vi_publish_88384f_idx"),
        ),
        migrations.AddIndex(
            model_name="externalvideo",
            index=models.Index(fields=["is_published", "-published_at"], name="external_vi_is_publ_c3586b_idx"),
        ),
    ]
