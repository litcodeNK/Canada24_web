import os
import uuid

from django.core.files.storage import default_storage
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from .constants import SECTION_BY_SLUG, SECTION_DEFINITIONS
from .models import Article, ExternalVideo, NewsVideo, UserPost
from .querysets import annotate_article_queryset
from .serializers import (
    ArticleSerializer,
    SectionSerializer,
    UserPostSerializer,
    UserVideoPostSerializer,
    VideoItemSerializer,
    format_relative_time,
)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB

ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-m4v", "video/webm"}
MAX_VIDEO_BYTES = 100 * 1024 * 1024  # 100 MB


def _video_repost_stats(video_type, video_id, user) -> tuple[int, bool]:
    from apps.interactions.models import VideoRepost

    reposts_count = VideoRepost.objects.filter(video_type=video_type, video_id=video_id).count()
    is_reposted = bool(
        user
        and user.is_authenticated
        and VideoRepost.objects.filter(user=user, video_type=video_type, video_id=video_id).exists()
    )
    return reposts_count, is_reposted


def build_uploaded_video_item(video: NewsVideo, request) -> dict:
    from apps.interactions.models import VideoRepost

    thumbnail_url = request.build_absolute_uri(video.thumbnail.url) if video.thumbnail else ""
    video_url = request.build_absolute_uri(video.video_file.url)
    reposts_count, is_reposted = _video_repost_stats(VideoRepost.VideoType.UPLOADED, video.pk, request.user)

    return {
        "id": f"uploaded-video-{video.pk}",
        "title": video.title,
        "description": video.description,
        "duration": "",
        "show_duration": False,
        "date": format_relative_time(video.created_at),
        "img_url": thumbnail_url,
        "is_live": False,
        "live_text": "",
        "source_url": "",
        "video_url": video_url,
        "reposts_count": reposts_count,
        "is_reposted": is_reposted,
    }


def build_external_video_item(video: ExternalVideo, request) -> dict:
    from apps.interactions.models import VideoRepost

    reposts_count, is_reposted = _video_repost_stats(VideoRepost.VideoType.EXTERNAL, video.pk, request.user)

    return {
        "id": f"external-video-{video.pk}",
        "title": video.title,
        "description": video.description,
        "duration": "",
        "show_duration": False,
        "date": format_relative_time(video.published_at),
        "img_url": video.thumbnail_url,
        "is_live": video.is_live,
        "live_text": "LIVE" if video.is_live else "",
        "source_url": video.source_url,
        "video_url": "",
        "reposts_count": reposts_count,
        "is_reposted": is_reposted,
    }


class SearchThrottle(AnonRateThrottle):
    scope = "search"


class ArticleListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ArticleSerializer
    filterset_fields = ["category", "source", "is_live", "is_updated", "feed_key", "regions__slug"]
    search_fields = ["headline", "body", "author"]
    ordering_fields = ["published_at", "headline"]
    ordering = ["-published_at"]

    def get_queryset(self):
        queryset = Article.objects.prefetch_related("regions").all()
        return annotate_article_queryset(queryset, user=self.request.user)


class ArticleDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        queryset = Article.objects.prefetch_related("regions").all()
        return annotate_article_queryset(queryset, user=self.request.user)


class TopStoriesView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        queryset = Article.objects.prefetch_related("regions").order_by("-published_at", "-id")
        return annotate_article_queryset(queryset, user=self.request.user)


class LocalNewsView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        raw_regions = self.request.query_params.get("regions", "")
        slugs = [slug.strip() for slug in raw_regions.split(",") if slug.strip()]
        if not slugs and self.request.user.is_authenticated:
            slugs = list(
                self.request.user.user_regions.select_related("region").values_list("region__slug", flat=True)
            )

        queryset = Article.objects.prefetch_related("regions").order_by("-published_at")
        if slugs:
            queryset = queryset.filter(regions__slug__in=slugs).distinct()
            if queryset.exists():
                return annotate_article_queryset(queryset, user=self.request.user)
        return annotate_article_queryset(
            queryset,
            user=self.request.user,
        )


class SectionListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        serializer = SectionSerializer(SECTION_DEFINITIONS, many=True)
        return Response(serializer.data)


class SectionArticleListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        section = SECTION_BY_SLUG.get(self.kwargs["slug"])
        if section is None:
            return Article.objects.none()
        queryset = Article.objects.prefetch_related("regions").filter(category=section["code"]).order_by("-published_at")
        return annotate_article_queryset(queryset, user=self.request.user)


class ArticleSearchView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [SearchThrottle]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()
        queryset = Article.objects.prefetch_related("regions").order_by("-published_at")
        if not query:
            return queryset.none()
        queryset = queryset.filter(
            Q(headline__icontains=query)
            | Q(body__icontains=query)
            | Q(author__icontains=query)
        )
        return annotate_article_queryset(queryset, user=self.request.user)


class CommunityArticleListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ArticleSerializer

    def get_queryset(self):
        queryset = (
            Article.objects.prefetch_related("regions")
            .filter(source=Article.Source.USER, feed_key="community")
            .order_by("-published_at", "-id")
        )
        return annotate_article_queryset(queryset, user=self.request.user)


class VideoListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        uploaded_videos = [
            {
                "sort_at": video.created_at,
                "payload": build_uploaded_video_item(video, request),
            }
            for video in NewsVideo.objects.filter(is_published=True)[:10]
        ]
        external_videos = [
            {
                "sort_at": video.published_at,
                "payload": build_external_video_item(video, request),
            }
            for video in ExternalVideo.objects.filter(is_published=True)[:10]
        ]
        combined = sorted(
            uploaded_videos + external_videos,
            key=lambda item: item["sort_at"],
            reverse=True,
        )[:10]

        payload = {
            "trending": VideoItemSerializer(
                [item["payload"] for item in combined],
                many=True,
            ).data,
            "live": [],
        }
        return Response(payload)


class UserPostListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserPostSerializer

    def get_queryset(self):
        return UserPost.objects.select_related("user").filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status=UserPost.Status.PENDING)


class UserPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserPostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = UserPost.objects.select_related("user")
        if self.request.method in permissions.SAFE_METHODS:
            if self.request.user.is_authenticated:
                return queryset.filter(Q(status=UserPost.Status.APPROVED) | Q(user=self.request.user))
            return queryset.filter(status=UserPost.Status.APPROVED)
        return queryset.filter(user=self.request.user)


class UserVideoPostListCreateView(generics.ListCreateAPIView):
    """Lets a signed-in user submit their own video, same moderation gate as
    UserPost: it's created unpublished and only shows up in /videos/ once an
    admin approves it (flips is_published) in Django admin."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]
    serializer_class = UserVideoPostSerializer

    def get_queryset(self):
        return NewsVideo.objects.filter(user=self.request.user).order_by("-created_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        file = request.FILES.get("video_file")
        if not file:
            return Response(
                {"detail": "No video provided. Send as multipart field 'video_file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if file.size > MAX_VIDEO_BYTES:
            return Response({"detail": "Video must be under 100 MB."}, status=status.HTTP_400_BAD_REQUEST)
        content_type = getattr(file, "content_type", "") or ""
        if content_type not in ALLOWED_VIDEO_TYPES:
            return Response(
                {"detail": "Unsupported video type. Use MP4, MOV, M4V, or WebM."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, is_published=False)


class ImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("image")
        if not file:
            return Response({"detail": "No image provided. Send as multipart field 'image'."}, status=status.HTTP_400_BAD_REQUEST)

        if file.size > MAX_IMAGE_BYTES:
            return Response({"detail": "Image must be under 10 MB."}, status=status.HTTP_400_BAD_REQUEST)

        content_type = getattr(file, "content_type", "") or ""
        if content_type not in ALLOWED_IMAGE_TYPES:
            return Response({"detail": "Unsupported image type. Use JPEG, PNG, GIF, or WebP."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from PIL import Image as PILImage
            img = PILImage.open(file)
            img.verify()
            file.seek(0)
        except Exception:
            return Response({"detail": "File is not a valid image."}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(file.name)[1].lower() or ".jpg"
        safe_ext = ext if ext in {".jpg", ".jpeg", ".png", ".gif", ".webp"} else ".jpg"
        filename = f"uploads/{uuid.uuid4().hex}{safe_ext}"
        saved_path = default_storage.save(filename, file)
        url = request.build_absolute_uri(default_storage.url(saved_path))

        return Response({"url": url}, status=status.HTTP_201_CREATED)
