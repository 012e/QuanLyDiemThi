from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **options):
        user = User.objects.create_superuser(
            username="admin", password="admin", email="admin@admin.com", first_name="admin", last_name="admin"
        )
