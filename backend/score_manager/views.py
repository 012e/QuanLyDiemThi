from constance import config
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

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

    def perform_update(self, serializer):
        student = serializer.save()
        classes = self.request.data.get("classes")
        if classes is not None:  # Neu "classes" key duoc cung cap trong request
            student.classes.set(classes)  # update student class truc tiep


class ClassViewSet(viewsets.ModelViewSet):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class DifficultyViewSet(viewsets.ModelViewSet):
    queryset = Difficulty.objects.all()
    pagination_class = None
    serializer_class = DifficultySerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

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


class ConfigView(APIView):
    def get(self, request):
        config_data = {key: getattr(config, key) for key in settings.CONSTANCE_CONFIG}
        return Response(config_data)

    def put(self, request):
        for key, value in request.data.items():
            if key in settings.CONSTANCE_CONFIG:
                setattr(config, key, value)
        return Response(
            {"message": "Configuration updated successfully"}, status=status.HTTP_200_OK
        )
