from django.conf import settings
from django.urls import path

from .views import MyRegionsView, RegionListView

urlpatterns = [
    path("", RegionListView.as_view(), name="region-list"),
]

if settings.ENABLE_MANAGE_REGIONS:
    urlpatterns.append(path("me/", MyRegionsView.as_view(), name="my-regions"))
