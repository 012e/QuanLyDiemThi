from decimal import Decimal
from typing import Dict

import pandas as pd
import rest_framework.serializers as serializers
from constance import config
from django.conf import settings
from django.contrib.auth.hashers import BasePasswordHasher
from django.contrib.auth.models import User
from .models import Result, Student, StudentResult


def import_student_results(file_path, result_id):
    df = pd.read_excel(file_path)

    if df["student_code"].duplicated().any():
        raise serializers.ValidationError(
            {"student code": "Student code is duplicated"}
        )

    try:
        result_instance = Result.objects.get(id=result_id)
    except Result.DoesNotExist:
        raise serializers.ValidationError({"result": "Result doesn not exists"})

    student_results = []

    for index, row in df.iterrows():
        try:
            student = Student.objects.get(student_code=row["student_code"])

            student_result = StudentResult(
                student=student,
                result=result_instance,
                score=Decimal(row["score"]),
                note=row["note"],
            )

            student_results.append(student_result)

        except Student.DoesNotExist:
            raise serializers.ValidationError({"student code": "Student code does not exists"})
        except Exception:
            print({"Unknown error": "Can not parse student result"})

    if student_results:
        StudentResult.objects.filter(result=result_instance).delete()
        StudentResult.objects.bulk_create(student_results)


def set_settings_as_dict() -> list[Dict[str, object]]:
    setting_list = []
    configs = getattr(settings, "CONSTANCE_CONFIG", {}).items()
    for key, options in configs:
        help_text = options[1]
        data = {
            "key": key,
            "help_text": help_text,
            "value": getattr(config, key),
        }
        setting_list.append(data)
    return setting_list


def get_role(user: User) -> str:
    if user.is_superuser:
        return "admin"
    elif user.is_staff:
        return "staff"
    return "user"


# WARN: TESTING PURPOSES ONLY
class PlainTextPasswordHasher(BasePasswordHasher):
    """
    A plain text password hasher that does not hash the password or use a salt.
    This is NOT recommended for production use as it stores passwords in plain text.
    """

    algorithm = "plain"

    def salt(self):
        """Return an empty salt."""
        return ""

    def encode(self, password, salt):
        """Return the password as is, without encoding."""
        return f"{self.algorithm}${password}"

    def verify(self, password, encoded):
        """Check if the given password matches the stored encoded password."""
        algorithm, encoded_password = encoded.split("$", 1)
        return password == encoded_password

    def safe_summary(self, encoded):
        """Provide a summary of the encoded password."""
        algorithm, encoded_password = encoded.split("$", 1)
        return {
            "algorithm": algorithm,
            "password": encoded_password,
        }

    def must_update(self, encoded):
        """Indicate whether the password needs to be updated."""
        return False

    def harden_runtime(self, password, encoded):
        """No additional runtime hardening needed for plain text."""
        pass
