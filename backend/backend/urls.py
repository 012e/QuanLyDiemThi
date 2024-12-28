from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers

from score_manager.serializers import PermissionSerializer
from score_manager.views import (
    AnnualReportView,
    ClassStudentsViewSet,
    ClassViewSet,
    ConfigView,
    DifficultyViewSet,
    PermissionViewSet,
    QuestionViewSet,
    ResultDetailViewSet,
    ResultViewSet,
    StudentResultViewSet,
    StudentViewSet,
    SubjectViewSet,
    TestViewSet,
    UserViewSet,
    RoleViewSet,
)

router = DefaultRouter()
router.register(r"question", QuestionViewSet, basename="question")
router.register(r"difficulty", DifficultyViewSet, basename="difficulty")
router.register(r"subject", SubjectViewSet, basename="subject")
router.register(r"test", TestViewSet, basename="test")
router.register(r"user", UserViewSet, basename="user")
router.register(r"result", ResultViewSet, basename="result")
router.register(r"student", StudentViewSet, basename="student")
router.register(r"class", ClassViewSet, basename="class")
router.register(r"studentresult", StudentResultViewSet, basename="studentresult")
router.register(r"role", RoleViewSet, basename="role")
router.register(r"permission", PermissionViewSet, basename="permission")

result_detail = nested_routers.NestedSimpleRouter(router, r"result", lookup="result")
result_detail.register(r"detail", ResultDetailViewSet, basename="detail-results")

class_students = nested_routers.NestedSimpleRouter(router, r"class", lookup="class")
class_students.register(r"student", ClassStudentsViewSet, basename="class-students")

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
    path(r"summary", AnnualReportView.as_view(), name="summary"),
    path("", include(result_detail.urls)),
    path("", include(class_students.urls)),
]
