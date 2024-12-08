from datetime import datetime

from constance import config
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
)
from rest_framework import status, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Class,
    Difficulty,
    Question,
    Result,
    Student,
    StudentResult,
    Subject,
    Test,
)
from .serializers import (
    ClassSerializer,
    DifficultySerializer,
    QuestionSerializer,
    ResultSerializer,
    StudentResultSerializer,
    StudentSerializer,
    SubjectSerializer,
    UserSerializer,
    TestSerializer,
    UserSerializer,
)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [OrderingFilter]
    ordering = ["name"]

    def perform_update(self, serializer):
        student = serializer.save()
        classes = self.request.data.get("classes")
        if classes is not None:  # Neu "classes" key duoc cung cap trong request
            student.classes.set(classes)  # update student class truc tiep


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer

    filter_backends = [OrderingFilter]
    ordering = ["name"]


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    filter_backends = [OrderingFilter, SearchFilter]
    search_fields = ["detail", "subject__name", "difficulty__name"]
    ordering = ["-updated_at"]


class DifficultyViewSet(viewsets.ModelViewSet):
    queryset = Difficulty.objects.all()
    pagination_class = None
    filter_backends = [OrderingFilter]
    ordering = ["id"]
    serializer_class = DifficultySerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    pagination_class = None

    filter_backends = [OrderingFilter]
    ordering = ["name"]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [OrderingFilter]
    ordering = ["-date_joined"]


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

    filter_backends = [OrderingFilter]
    ordering = ["-updated_at"]

    def perform_create(self, serializer):
        test = serializer.save()
        questions = self.request.data.get("questions")
        if questions:
            test.questions.set(questions)

    def perform_update(self, serializer):
        test = serializer.save()
        questions = self.request.data.get("questions")
        if questions is not None:
            test.questions.set(questions)


class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    filter_backends = [OrderingFilter]
    ordering = ["-updated_at"]

    def perform_create(self, serializer):
        result = serializer.save()
        classes = self.request.data.get("classes")
        if classes:
            result.classes.set(classes)

    def perform_update(self, serializer):
        result = serializer.save()
        classes = self.request.data.get("classes")
        if classes:
            result.classes.set(classes)


class StudentResultViewSet(viewsets.ModelViewSet):
    queryset = StudentResult.objects.all()
    serializer_class = StudentResultSerializer
    filter_backends = [OrderingFilter]
    ordering = ["-updated_at"]

    def perform_create(self, serializer):
        student_result = serializer.save()
        student = student_result.student
        student_result.classes.set(self.request.data.get("classes", []))

    def perform_update(self, serializer):
        student_result = serializer.save()
        student_result.classes.set(self.request.data.get("classes", []))


class ConfigView(APIView):
    @extend_schema(
        summary="Retrieve configuration settings",
        description="Fetches all configuration settings as a key-value dictionary.",
        responses={
            200: OpenApiResponse(
                response={
                    "type": "object",
                    "additionalProperties": {
                        "type": "string",
                        "description": "The value of the configuration setting.",
                    },
                },
                description="A dictionary of all configuration settings.",
                examples=[
                    OpenApiExample(
                        name="Successful Response",
                        value={
                            "SETTING_1": "value_1",
                            "SETTING_2": "value_2",
                            "SETTING_3": "value_3",
                        },
                        description="Example of a dictionary containing configuration settings.",
                    )
                ],
            )
        },
    )
    def get(self, request):
        config_data = {key: getattr(config, key) for key in settings.CONSTANCE_CONFIG}
        return Response(config_data)

    @extend_schema(
        summary="Update configuration settings",
        description=(
            "Accepts a list of key-value pairs to update the configuration settings. "
            "Each item in the list must be a dictionary containing a `key` and `value`. "
            "Invalid keys will result in a 400 response with details about the errors."
        ),
        request={
            "application/json": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "key": {
                            "type": "string",
                            "description": "The name of the configuration setting to update.",
                        },
                        "value": {
                            "type": "string",
                            "description": "The new value for the configuration setting.",
                        },
                    },
                    "required": ["key", "value"],
                },
            }
        },
        #     400:
        responses={
            200: OpenApiResponse(
                response={
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string",
                            "example": "Configuration updated successfully",
                        }
                    },
                },
                description="Configuration updated successfully.",
            ),
            400: OpenApiResponse(
                response={
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string",
                            "example": "Invalid keys: INVALID_SETTING",
                        }
                    },
                },
                description="Invalid request or invalid keys.",
                examples=[
                    OpenApiExample(
                        "Invalid Keys",
                        value={"message": "Invalid keys: INVALID_SETTING"},
                    ),
                    OpenApiExample(
                        "Invalid Format",
                        value={
                            "message": "Each item must be a dictionary with 'key' and 'value' fields",
                        },
                    ),
                ],
            ),
        },
        examples=[
            OpenApiExample(
                "Valid Request Example",
                value=[
                    {"key": "SETTING_1", "value": "new_value_1"},
                    {"key": "SETTING_2", "value": "new_value_2"},
                ],
                request_only=True,
            ),
            OpenApiExample(
                "Invalid Request Example",
                value=[
                    {"key": "INVALID_SETTING", "value": "some_value"},
                    {"key": "SETTING_2"},
                ],
                request_only=True,
            ),
            OpenApiExample(
                "Successful Response",
                value={"message": "Configuration updated successfully"},
                response_only=True,
            ),
            OpenApiExample(
                "Error Response: Invalid Keys",
                value={"message": "Invalid keys: INVALID_SETTING"},
                response_only=True,
            ),
        ],
    )
    def put(self, request):
        if not isinstance(request.data, list):
            return Response(
                {"message": "Request data should be a list of key-value pairs"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        invalid_keys = []
        invalid_values = []
        for item in request.data:
            if not isinstance(item, dict) or "key" not in item or "value" not in item:
                return Response(
                    {
                        "message": "Each item must be a dictionary with 'key' and 'value' fields"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            key, value = item["key"], item["value"]
            if key in settings.CONSTANCE_CONFIG:
                data_type = settings.CONSTANCE_CONFIG[key][2]
                try:
                    parsed_value = data_type(value)
                    setattr(config, key, parsed_value)
                except ValueError:
                    invalid_values.append(value)
            else:
                invalid_keys.append(key)

        if invalid_keys or invalid_values:
            message = []
            if invalid_keys:
                message.append(f"Invalid keys: {', '.join(invalid_keys)}")
            if invalid_values:
                message.append(f"Invalid values: {', '.join(invalid_values)}")

            return Response(
                {"message": "\n".join(message)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "Configuration updated successfully"},
            status=status.HTTP_200_OK,
        )


@extend_schema(
    summary="Retrieve yearly statistics for tests and results",
    description=(
        "Fetches total tests and total results for a given year. "
        "Additionally, the statistics are grouped by subjects with their respective totals, "
        "including the ratio of tests and results for each subject."
    ),
    parameters=[
        OpenApiParameter(
            name="year",
            type=int,
            description="The year to retrieve statistics for (e.g., 2023).",
            required=True,
        ),
    ],
    responses={
        200: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "total_tests": {"type": "integer", "example": 120},
                    "total_results": {"type": "integer", "example": 300},
                    "subjects": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string", "example": "Math"},
                                "total_tests": {"type": "integer", "example": 50},
                                "total_results": {"type": "integer", "example": 120},
                                "test_ratio": {
                                    "type": "number",
                                    "format": "float",
                                    "example": 0.42,
                                },
                                "result_ratio": {
                                    "type": "number",
                                    "format": "float",
                                    "example": 0.4,
                                },
                            },
                        },
                    },
                },
            },
            description="Successfully retrieved the statistics for the given year.",
            examples=[
                OpenApiExample(
                    name="Successful Response",
                    value={
                        "total_tests": 120,
                        "total_results": 300,
                        "subjects": [
                            {
                                "name": "Math",
                                "total_tests": 50,
                                "total_results": 120,
                                "test_ratio": 0.42,
                                "result_ratio": 0.4,
                            },
                            {
                                "name": "Science",
                                "total_tests": 70,
                                "total_results": 180,
                                "test_ratio": 0.58,
                                "result_ratio": 0.6,
                            },
                        ],
                    },
                    description="Example of a successful response with total tests, total results, and grouped statistics by subject including ratios.",
                ),
            ],
        ),
        400: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "error": {
                        "type": "string",
                        "example": "Year parameter is required.",
                    },
                },
            },
            description="Invalid request or missing 'year' parameter.",
            examples=[
                OpenApiExample(
                    name="Missing Year Parameter",
                    value={"error": "Year parameter is required."},
                    description="Example of error response when 'year' parameter is not provided.",
                ),
                OpenApiExample(
                    name="Invalid Year Format",
                    value={"error": "Invalid year format."},
                    description="Example of error response for invalid year format.",
                ),
                OpenApiExample(
                    name="Year Out of Range",
                    value={"error": "Year is out of range."},
                    description="Example of error response when the year is out of range.",
                ),
            ],
        ),
    },
)
class AnnualReportView(APIView):
    def get(self, request, *args, **kwargs):
        # Extract year from query parameters
        year = request.query_params.get("year")
        if not year:
            return Response(
                {"error": "Year parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            year = int(year)
        except ValueError:
            return Response(
                {"error": "Invalid year format."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the year is valid
        if year < 1900 or year > timezone.now().year:
            return Response(
                {"error": "Year is out of range."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Get the total tests and results for the given year
        start_date = datetime(year, 1, 1)
        end_date = datetime(year + 1, 1, 1)

        total_tests = Test.objects.filter(
            datetime__range=(start_date, end_date)
        ).count()
        total_results = Result.objects.filter(
            created_at__range=(start_date, end_date)
        ).count()

        # Ensure we don't divide by zero
        test_ratio_value = (
            total_tests if total_tests > 0 else 1
        )  # Prevent division by zero
        result_ratio_value = (
            total_results if total_results > 0 else 1
        )  # Prevent division by zero

        # Group data by subject: total tests, total results, and their ratios for the given year
        subject_data = (
            Subject.objects.annotate(
                total_tests=Count(
                    "test", filter=Q(test__datetime__range=(start_date, end_date))
                ),
                total_results=Count(
                    "test__result",
                    filter=Q(test__datetime__range=(start_date, end_date)),
                ),
            )
            .values("name", "total_tests", "total_results")
            .order_by("name")
        )

        # Loop through each subject and calculate the ratios
        for subject in subject_data:
            subject["test_ratio"] = subject["total_tests"] / test_ratio_value
            subject["result_ratio"] = subject["total_results"] / result_ratio_value

        # Prepare the response data
        data = {
            "total_tests": total_tests,
            "total_results": total_results,
            "subjects": list(subject_data),
        }

        return Response(data, status=status.HTTP_200_OK)
