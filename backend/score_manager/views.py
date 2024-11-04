from rest_framework import viewsets, permissions
from rest_framework.response import Response

from score_manager import utils
from .models import Question, Difficulty, Subject, Test, Result
from .serializers import QuestionSerializer, DifficultySerializer, SubjectSerializer, TestSerializer, ResultSerializer


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

    def perform_create(self, serializer):
        test = serializer.save()
        questions = self.request.data.get('questions')
        if questions:
            test.questions.set(questions)  

    def perform_update(self, serializer):
        test = serializer.save()
        questions = self.request.data.get('questions')
        if questions is not None:
            test.questions.set(questions)  

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    
    
class SettingViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(utils.set_settings_as_dict())
    
