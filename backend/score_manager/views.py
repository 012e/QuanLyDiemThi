from unittest import TestSuite
from rest_framework import viewsets
from .models import Difficulty, Question, Test
from .serializers import DifficultySerializer, QuestionSerializer, TestSerializer


class DifficultyViewSet(viewsets.ModelViewSet):
    queryset = Difficulty.objects.all()
    serializer_class = DifficultySerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
