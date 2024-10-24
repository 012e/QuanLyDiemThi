from typing import Dict
from constance import config
from django.conf import settings


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
