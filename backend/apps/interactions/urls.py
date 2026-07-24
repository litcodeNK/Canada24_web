from django.urls import path

from .views import (
    ArticleCommentListCreateView,
    CommentDeleteView,
    ReactionSummaryView,
    ReactionToggleView,
    RepostToggleView,
    SaveToggleView,
    SavedArticleListView,
    VideoRepostToggleView,
)

urlpatterns = [
    path("articles/<int:pk>/react/", ReactionToggleView.as_view(), name="article-react"),
    path("articles/<int:pk>/reactions/", ReactionSummaryView.as_view(), name="article-reactions"),
    path("articles/<int:pk>/comments/", ArticleCommentListCreateView.as_view(), name="article-comments"),
    path("comments/<int:pk>/", CommentDeleteView.as_view(), name="comment-delete"),
    path("articles/<int:pk>/repost/", RepostToggleView.as_view(), name="article-repost"),
    path("articles/<int:pk>/save/", SaveToggleView.as_view(), name="article-save"),
    path("saved/", SavedArticleListView.as_view(), name="saved-articles"),
    path("videos/<str:video_key>/repost/", VideoRepostToggleView.as_view(), name="video-repost"),
]
