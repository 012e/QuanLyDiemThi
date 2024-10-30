from rest_framework import viewsets, permissions
from rest_framework.response import Response

from score_manager import utils
from .models import Question, Difficulty
from .serializers import QuestionSerializer, DifficultySerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class DifficultyViewSet(viewsets.ModelViewSet):
    queryset = Difficulty.objects.all()
    serializer_class = DifficultySerializer


class SettingViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(utils.set_settings_as_dict())
