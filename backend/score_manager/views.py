from rest_framework import viewsets, permissions
from rest_framework.response import Response

from score_manager import utils
from .models import Question, Difficulty, Subject, Test
from .serializers import QuestionSerializer, DifficultySerializer, SubjectSerializer, TestSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class DifficultyViewSet(viewsets.ModelViewSet):
    queryset = Difficulty.objects.all()
    serializer_class = DifficultySerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer


class SettingViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(utils.set_settings_as_dict())
    
