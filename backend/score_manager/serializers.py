import rest_framework.serializers as serializers
from .models import Student, Class, Question, Subject, Difficulty, Test, Result

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = '__all__'

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


class TestSerializer(serializers.ModelSerializer):
    questions = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all(), many=True)

    class Meta:
        model = Test
        fields = '__all__'  
        
class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__' 