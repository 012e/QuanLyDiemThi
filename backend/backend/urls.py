from rest_framework.routers import DefaultRouter
from score_manager.views import (
    ClassViewSet,
    QuestionViewSet,
    DifficultyViewSet,
    StudentViewSet,
    SubjectViewSet,
    TestViewSet,
    ResultViewSet,
    ConfigView,
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
router.register(r"subject", SubjectViewSet, basename="subject")
router.register(r"test", TestViewSet, basename="test")
router.register(r"results", ResultViewSet, basename="result")
router.register(r"student", StudentViewSet, basename="student")
router.register(r"class", ClassViewSet, basename="class")


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
    path("config/", ConfigView.as_view(), name="config-view"),
]
