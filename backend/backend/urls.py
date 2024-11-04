from rest_framework.routers import DefaultRouter
from score_manager.views import (
    QuestionViewSet,
    DifficultyViewSet,
    SettingViewSet,
    SubjectViewSet,
    TestViewSet,
    ResultViewSet
)
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

router = DefaultRouter()
router.register(r"question", QuestionViewSet, basename="question")
router.register(r"difficulty", DifficultyViewSet, basename="difficulty")
router.register(r"setting", SettingViewSet, basename="setting")
router.register(r"subject", SubjectViewSet, basename="subject")
router.register(r"test", TestViewSet, basename="test")
router.register(r'results', ResultViewSet)


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
    path("auth/", include("dj_rest_auth.urls")),
]
