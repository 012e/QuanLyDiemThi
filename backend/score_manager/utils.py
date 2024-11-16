from typing import Dict

from constance import config
from django.conf import settings
from django.contrib.auth.hashers import BasePasswordHasher
from django.contrib.auth.models import User


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
