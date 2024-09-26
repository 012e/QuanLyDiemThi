from unittest import TestSuite
from rest_framework import viewsets
from .models import Question, Test
from .serializers import QuestionSerializer, TestSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
