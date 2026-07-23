# Generated manually for TikTok curated links + user-submitted videos

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('news', '0009_tiktokcredential'),
    ]

    operations = [
        migrations.CreateModel(
            name='CuratedTikTokLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('url', models.URLField(max_length=1000, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('added_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'curated_tiktok_links',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='newsvideo',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='video_posts', to=settings.AUTH_USER_MODEL),
        ),
    ]
