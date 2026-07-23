# Generated manually for TikTok Display API integration

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0008_userpost_regions'),
    ]

    operations = [
        migrations.CreateModel(
            name='TikTokCredential',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account_username', models.CharField(blank=True, max_length=255)),
                ('open_id', models.CharField(blank=True, max_length=255)),
                ('access_token', models.TextField()),
                ('refresh_token', models.TextField()),
                ('access_token_expires_at', models.DateTimeField()),
                ('refresh_token_expires_at', models.DateTimeField()),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'tiktok_credentials',
            },
        ),
    ]
