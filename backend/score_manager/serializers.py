import rest_framework.serializers as serializers
from .models import Question, Subject, Difficulty


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = "__all__"


class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject
        fields = "__all__"


class DifficultySerializer(serializers.ModelSerializer):

    class Meta:
        model = Difficulty
        fields = "__all__"
