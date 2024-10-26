from django.core.management.base import BaseCommand
from score_manager.models import Difficulty, Question, Subject
from faker import Faker


fake = Faker()

TOTAL_QUESTIONS = 100


def seed_difficulty():
    Difficulty.objects.update_or_create(name="Dễ")
    Difficulty.objects.update_or_create(name="Trung Bình")
    Difficulty.objects.update_or_create(name="Phức Tạp")
    Difficulty.objects.update_or_create(name="Khó")


def seed_subject():
    Subject.objects.update_or_create(name="Toán")
    Subject.objects.update_or_create(name="Văn")
    Subject.objects.update_or_create(name="Anh")
    Subject.objects.update_or_create(name="Lý")
    Subject.objects.update_or_create(name="Hóa")
    Subject.objects.update_or_create(name="Sinh")
    Subject.objects.update_or_create(name="Sử")
    Subject.objects.update_or_create(name="Địa")


def seed_question():
    total_subject = Subject.objects.count()
    total_difficulty = Difficulty.objects.count()

    for _ in range(TOTAL_QUESTIONS):
        difficulty_id = fake.random_int(1, total_difficulty)
        subject_id = fake.random_int(1, total_subject)
        Question.objects.update_or_create(
            detail=fake.text(), difficulty_id=difficulty_id, subject_id=subject_id
        )


class Command(BaseCommand):
    def handle(self, *args, **options):
        seed_difficulty()
        seed_subject()
        seed_question()
