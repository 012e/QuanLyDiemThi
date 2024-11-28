from constance import config
from django.conf import settings
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, F

from .models import Class, Difficulty, Question, Result, Student, Subject, Test
from .serializers import (
    ClassSerializer,
    DifficultySerializer,
    QuestionSerializer,
    ResultSerializer,
    StudentSerializer,
    SubjectSerializer,
    TestSerializer,
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

class AnnualReportView(APIView):
    """
    Bao cao nam bao gom:
    - Tong luong de thi
    - so luong bai cham
    - ti le de thi
    - ti le bai cham
    """
    def get(self, request):
        # Lay nam 
        year = request.query_params.get('year')
        if not year:
            return Response({"error": "Year parameter is required."}, status=400)

        try:
            year = int(year)
        except ValueError:
            return Response({"error": "Year must be a valid integer."}, status=400)

        # so luong de thi va de thi da cham
        total_tests = Test.objects.filter(datetime__year=year).count()
        total_graded_papers = Result.objects.filter(test__datetime__year=year).count()

        # data mon thi
        report_data = (
            Test.objects.filter(datetime__year=year)
            .values(subject_name=F("subject__name"))
            .annotate(
                num_tests=Count("id"),
                num_graded_papers=Count("result"),
            )
            .order_by("subject_name")
        )

        # ti le bai thi
        for item in report_data:
            item["test_percentage"] = (
                (item["num_tests"] / total_tests) * 100 if total_tests else 0
            )
            item["graded_paper_percentage"] = (
                (item["num_graded_papers"] / total_graded_papers) * 100
                if total_graded_papers
                else 0
            )

        # tra ve
        return Response({
            "year": year,
            "total_tests": total_tests,
            "total_graded_papers": total_graded_papers,
            "subjects": report_data,
        })