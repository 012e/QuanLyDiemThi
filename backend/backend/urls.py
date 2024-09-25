from rest_framework.routers import DefaultRouter
from score_manager.views import DifficultyViewSet, QuestionViewSet, TestViewSet
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

router = DefaultRouter()
router.register(r"difficulty", DifficultyViewSet, basename="difficulty")
router.register(r"question", QuestionViewSet, basename="question")
router.register(r"test", TestViewSet, basename="test")

urlpatterns = [
    path("", include(router.urls)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Optional UI:
    path(
        "api/schema/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]
