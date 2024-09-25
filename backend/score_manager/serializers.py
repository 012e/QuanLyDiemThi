from typing_extensions import ReadOnly
import rest_framework.serializers as serializers
from .models import Question, Difficulty, Test, Subject


class DifficultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Difficulty
        fields = "__all__"


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"


class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject
        fields = "__all__"
