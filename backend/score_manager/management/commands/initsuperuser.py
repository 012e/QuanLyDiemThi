from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    def handle(self, *args, **options):
        user = User.objects.create_superuser(
            username="admin", password="admin", email="admin@admin.com", first_name="admin", last_name="admin"
        )
