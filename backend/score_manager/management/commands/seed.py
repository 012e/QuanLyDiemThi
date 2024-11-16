import logging
from datetime import datetime, timedelta

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from faker import Faker

from score_manager.models import Difficulty, Question, Student, Subject, Test

fake = Faker()

log = logging.getLogger("main")

TOTAL_QUESTIONS = 100
TOTAL_USERS = 50
TOTAL_STAFF = 10
TOTAL_TESTS = 30
TOTAL_STUDENTS = 100


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


def seed_staff():
    User.objects.create_user(
        username="staff", email=fake.email(), password="staff", is_staff=True
    )
    users = []
    for _ in range(TOTAL_STAFF):
        users.append(
            User(
                username=fake.user_name(),
                email=fake.email(),
                password=make_password(fake.password()),
                is_staff=True,
            )
        )

    User.objects.bulk_create(users, ignore_conflicts=True)


def seed_users():
    users = []
    for _ in range(TOTAL_STAFF):
        users.append(
            User(
                username=fake.user_name(),
                email=fake.email(),
                password=make_password(fake.password()),
            )
        )

    User.objects.bulk_create(users, ignore_conflicts=True)


def seed_students():
    students = []
    total_class = Subject.objects.count()
    for _ in range(TOTAL_STUDENTS):
        class_id = fake.random_int(1, total_class)
        students.append(Student(name=fake.name(), class_id=class_id))


def seed_question():
    total_subject = Subject.objects.count()
    total_difficulty = Difficulty.objects.count()

    questions = []
    for _ in range(TOTAL_QUESTIONS):
        difficulty_id = fake.random_int(1, total_difficulty)
        subject_id = fake.random_int(1, total_subject)
        questions.append(
            Question(
                detail=fake.text(), difficulty_id=difficulty_id, subject_id=subject_id
            )
        )
    Question.objects.bulk_create(questions, ignore_conflicts=True)


def get_random_time_delta():
    return fake.time_delta(end_datetime=datetime(2023, 12, 31))


def seed_test():
    total_subject = Subject.objects.count()
    total_questions = Question.objects.count()
    MIN_QUESTION_PER_TEST = 1
    MAX_QUESTION_PER_TEST = 5

    tests = []
    for _ in range(TOTAL_TESTS):
        subject_id = fake.random_int(1, total_subject)
        semester = fake.random_int(1, 3)
        tests.append(
            Test(
                subject_id=subject_id,
                semester=semester,
                datetime=fake.date_time_this_year(),
                duration=timedelta(minutes=fake.random_int(30, 180)),
            )
        )
    Test.objects.bulk_create(tests)

    for test in Test.objects.all():
        total_question = fake.random_int(MIN_QUESTION_PER_TEST, MAX_QUESTION_PER_TEST)
        question_ids = fake.random_sample(range(1, total_questions), total_question)
        test.questions.add(*question_ids)


class Command(BaseCommand):
    def handle(self, *args, **options):
        try:
            print("seeding user")
            seed_users()
            print("seeding staff")
            seed_staff()
            # print("seeding student")
            # seed_students()
            print("seeding difficulty")
            seed_difficulty()
            print("seeding subject")
            seed_subject()
            print("seeding question")
            seed_question()
            print("seeding test")
            seed_test()
        except Exception as e:
            log.error(e)
            log.error("Seed data failed")
