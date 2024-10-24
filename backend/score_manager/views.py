from rest_framework import viewsets, permissions
from rest_framework.response import Response

from score_manager import utils
from .models import Question, Test, Difficulty
from .serializers import QuestionSerializer, TestSerializer, DifficultySerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer


class DifficultyViewSet(viewsets.ModelViewSet):
    queryset = Difficulty.objects.all()
    serializer_class = DifficultySerializer


class SettingViewSet(viewsets.ViewSet):
    permission_classes = [
        permissions.IsAdminUser,
        permissions.IsAuthenticatedOrReadOnly,
    ]

    def list(self, request):
        return Response(utils.set_settings_as_dict())
