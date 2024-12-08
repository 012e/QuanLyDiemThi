import rest_framework.serializers as serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from score_manager.utils import get_role

from .models import (
    Class,
    Difficulty,
    Question,
    Result,
    Student,
    StudentResult,
    Subject,
    Test,
)


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
        representation["duration"] = instance.duration.total_seconds()
        return representation

    class Meta:
        model = Test
        exclude = ["created_at", "updated_at"]


class StudentResultSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all()
    )  # Accept student IDs

    class Meta:
        model = StudentResult
        fields = ["id", "student", "result", "score", "note"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "user_type",
            "password",
        ]

    def create(self, validated_data):
        user_type = validated_data.pop(
            "user_type", "user"
        )  # Default to 'user' if not provided
        password = validated_data.pop("password", None)
        user = User.objects.create(**validated_data)

        # Set user type (admin, staff, or user)
        if user_type == "admin":
            user.is_superuser = True
            user.is_staff = True
        elif user_type == "staff":
            user.is_staff = True

        if password:
            user.set_password(password)

        user.save()
        return user

    def update(self, instance, validated_data):
        user_type = validated_data.pop("user_type", None)
        password = validated_data.pop("password", None)

        # Update the user instance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle user_type change (update staff and superuser status)
        if user_type:
            if user_type == "admin":
                instance.is_superuser = True
                instance.is_staff = True
            elif user_type == "staff":
                instance.is_staff = True
            else:
                instance.is_superuser = False
                instance.is_staff = False

        if password:
            instance.set_password(password)

        instance.save()
        return instance

    def to_representation(self, instance):
        """Custom method to display the user_type in the response."""
        representation = super().to_representation(instance)
        if instance.is_superuser:
            representation["user_type"] = "admin"
        elif instance.is_staff:
            representation["user_type"] = "staff"
        else:
            representation["user_type"] = "user"
        return representation


class ResultSerializer(serializers.ModelSerializer):
    student_results = StudentResultSerializer(
        source="studentresult_set",  # Reverse relation
        many=True,
    )  # Allow nested input for StudentResult

    class Meta:
        model = Result
        fields = [
            "id",
            "test",
            "teacher",
            "classroom",
            "student_results",
        ]

    def create(self, validated_data):
        # Remove nested data from validated_data
        student_results_data = validated_data.pop("studentresult_set", [])

        # Create the Result instance
        result = Result.objects.create(**validated_data)

        # Create StudentResult instances
        for student_result_data in student_results_data:
            student_result_data.pop("result")
            StudentResult.objects.create(result=result, **student_result_data)

        return result

    def update(self, instance, validated_data):
        # Remove nested data from validated_data
        student_results_data = validated_data.pop("studentresult_set", [])

        # Update fields of the Result instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle StudentResult updates
        existing_student_results = {
            sr.id: sr for sr in instance.studentresult_set.all()
        }

        for student_result_data in student_results_data:
            sr_id = student_result_data.get("id")
            if sr_id and sr_id in existing_student_results:
                # Update existing StudentResult
                student_result_instance = existing_student_results.pop(sr_id)
                for attr, value in student_result_data.items():
                    setattr(student_result_instance, attr, value)
                student_result_instance.save()
            else:
                # Create a new StudentResult
                StudentResult.objects.create(result=instance, **student_result_data)

        # Delete any remaining StudentResult objects not included in input
        for remaining_sr in existing_student_results.values():
            remaining_sr.delete()

        return instance


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
