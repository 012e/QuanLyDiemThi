import rest_framework.serializers as serializers
from django.contrib.auth.models import User
from drf_spectacular.utils import extend_schema_field
from environ import logging
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from score_manager.utils import get_role

from .models import (
    Class,
    Difficulty,
    Question,
    QuestionInTestModel,
    Result,
    Student,
    StudentResult,
    Subject,
    Test,
)


class SafeUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class ClassSerializer(serializers.ModelSerializer):
    teacher_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=User.objects.all(), allow_null=False, required=True
    )

    teacher = SafeUserSerializer(read_only=True)

    def create(self, validated_data):
        teacher_id = validated_data.pop("teacher_id")
        classroom = Class.objects.create(**validated_data, teacher=teacher_id)
        return classroom

    def update(self, instance, validated_data):
        # Update fields on the instance
        teacher_id = validated_data.pop("teacher_id", None)
        if teacher_id:
            instance.teacher = teacher_id  # Update teacher

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()  # Save changes to the database
        return instance

    class Meta:
        model = Class
        fields = ["id", "name", "teacher", "teacher_id"]


class StudentSerializer(serializers.ModelSerializer):
    classroom_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=Class.objects.all(), allow_null=False, required=True
    )
    classroom = ClassSerializer(read_only=True)

    def create(self, validated_data):
        classroom_id = validated_data.pop("classroom_id")
        student = Student.objects.create(**validated_data, classroom=classroom_id)
        return student

    def update(self, instance, validated_data):
        # Update fields on the instance
        classroom_id = validated_data.pop("classroom_id", None)
        if classroom_id:
            instance.classroom = classroom_id  # Update classroom

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()  # Save changes to the database
        return instance

    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "student_code",
            "classroom",
            "classroom_id",
            "created_at",
            "updated_at",
        ]


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


class QuestionInTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionInTestModel
        fields = "__all__"


class TestSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField("get_questions")

    @extend_schema_field(serializers.ListField(child=serializers.IntegerField()))
    def get_questions(self, obj):
        # Query related questions from QuestionInTestModel and order them by "order"
        question_ids = (
            QuestionInTestModel.objects.filter(test=obj)
            .order_by("order")
            .values_list("question_id", flat=True)
        )
        return list(question_ids)

    def to_internal_value(self, data):
        # Ensure `questions` is handled during deserialization
        questions = data.pop("questions", None)
        validated_data = super().to_internal_value(data)

        if questions is not None:
            # Validate question IDs are a list of integers
            if not isinstance(questions, list):
                raise serializers.ValidationError(
                    {"questions": "Must be a list of question IDs."}
                )
            if not all(isinstance(q, int) for q in questions):
                raise serializers.ValidationError(
                    {"questions": "All question IDs must be integers."}
                )

            # Validate that all question IDs exist in the database
            existing_questions = set(
                Question.objects.filter(id__in=questions).values_list("id", flat=True)
            )
            invalid_questions = set(questions) - existing_questions
            if invalid_questions:
                raise serializers.ValidationError(
                    {
                        "questions": f"The following question IDs do not exist: {list(invalid_questions)}"
                    }
                )

        validated_data["questions"] = questions
        return validated_data

    def create(self, validated_data):
        # Extract questions from validated_data
        question_ids = validated_data.pop("questions", [])
        test = Test.objects.create(**validated_data)

        question_in_test_objects = [
            QuestionInTestModel(test=test, question_id=question_id, order=order)
            for order, question_id in enumerate(question_ids, start=1)
        ]
        QuestionInTestModel.objects.bulk_create(question_in_test_objects)

        return test

    def update(self, instance, validated_data):
        logging.info("updating test")
        # Extract questions from validated_data
        question_ids = validated_data.pop("questions", None)

        # Update the test instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update questions if provided
        if question_ids is not None:
            QuestionInTestModel.objects.filter(test=instance).delete()

            question_in_test_objects = [
                QuestionInTestModel(test=instance, question_id=question_id, order=order)
                for order, question_id in enumerate(question_ids, start=1)
            ]
            QuestionInTestModel.objects.bulk_create(question_in_test_objects)

        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["duration"] = instance.duration.total_seconds()
        return representation

    class Meta:
        model = Test
        fields = "__all__"


class StandaloneStudentResultSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(),
        source="student",
        required=True,
        write_only=True,
    )

    class Meta:
        model = StudentResult
        fields = [
            "id",
            "student",
            "student_id",
            "score",
            "note",
            "created_at",
            "updated_at",
        ]


class UserSerializer(serializers.ModelSerializer):
    user_type = serializers.ChoiceField(
        choices=["admin", "staff", "user"], write_only=True
    )
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

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


class StudentResultSerializer(serializers.ModelSerializer):
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), source="student", required=True
    )

    class Meta:
        model = StudentResult
        fields = ["id", "student_id", "score", "note", "created_at", "updated_at"]


class ResultSerializer(serializers.ModelSerializer):
    teacher_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=User.objects.all(), allow_null=False, required=True
    )
    teacher = SafeUserSerializer(read_only=True)

    classroom_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=Class.objects.all(), allow_null=False, required=True
    )
    classroom = ClassSerializer(read_only=True)

    test_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=Test.objects.all(), allow_null=False, required=True
    )
    test = TestSerializer(read_only=True)

    total_results = serializers.IntegerField(
        source="studentresult_set.count",
        read_only=True,
    )

    class Meta:
        model = Result
        fields = [
            "id",
            "test",
            "test_id",
            "teacher",
            "teacher_id",
            "classroom",
            "classroom_id",
            "total_results",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        teacher_id = validated_data.pop("teacher_id")
        classroom_id = validated_data.pop("classroom_id")
        test_id = validated_data.pop("test_id")

        result = Result.objects.create(
            teacher=teacher_id, classroom=classroom_id, test=test_id
        )
        return result

    def update(self, instance, validated_data):
        data = {}
        if "teacher_id" in validated_data:
            data["teacher"] = validated_data.pop("teacher_id")
        if "classroom_id" in validated_data:
            data["classroom"] = validated_data.pop("classroom_id")
        if "test_id" in validated_data:
            data["test"] = validated_data.pop("test_id")
        return Result.objects.filter(pk=instance.pk).update(**data)


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
