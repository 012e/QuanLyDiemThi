import humanize
import rest_framework.serializers as serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from score_manager.utils import get_role

from .models import Class, Difficulty, Question, Result, Student, Subject, Test


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        exclude = ["created_at", "updated_at"]


class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = "__all__"


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        exclude = ["created_at", "updated_at"]


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class DifficultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Difficulty
        fields = "__all__"


class TestSerializer(serializers.ModelSerializer):
    questions = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(), many=True
    )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["duration"] = humanize.precisedelta(instance.duration)
        return representation

    class Meta:
        model = Test
        exclude = ["created_at", "updated_at"]


class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        exclude = ["created_at", "updated_at"]


class ConfigUpdateSerializer(serializers.Serializer):
    key = serializers.CharField(
        help_text="The name of the configuration setting to update."
    )
    value = serializers.CharField(
        help_text="The new value for the configuration setting."
    )


class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = get_role(user)
        return token
