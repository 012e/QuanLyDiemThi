import logging
import random
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from faker import Faker

from score_manager.models import (
    Class,
    Difficulty,
    Permission,
    Question,
    QuestionInTestModel,
    Result,
    Role,
    Student,
    StudentResult,
    Subject,
    Test,
)

User = get_user_model()

fake = Faker()
fake.seed_instance(696969)
random.seed(696969)


log = logging.getLogger("main")

TOTAL_QUESTIONS = 100
TOTAL_USERS = 50
TOTAL_STAFF = 10
TOTAL_TESTS = 300
TOTAL_STUDENTS = 800
TOTAL_CLASSES = 20


def bulk_create_users(users):
    User.objects.bulk_create(
        users,
        update_conflicts=True,
        unique_fields=["username"],
        update_fields=["password"],
    )


def seed_difficulty():
    Difficulty.objects.update_or_create(name="Easy")
    Difficulty.objects.update_or_create(name="Average")
    Difficulty.objects.update_or_create(name="Complex")
    Difficulty.objects.update_or_create(name="Difficult")


def seed_subject():
    Subject.objects.update_or_create(name="Math")
    Subject.objects.update_or_create(name="Literature")
    Subject.objects.update_or_create(name="English")
    Subject.objects.update_or_create(name="Physics")
    Subject.objects.update_or_create(name="Chemistry")
    Subject.objects.update_or_create(name="Biology")
    Subject.objects.update_or_create(name="History")
    Subject.objects.update_or_create(name="Geography")
    Subject.objects.update_or_create(name="Physical Education")
    Subject.objects.update_or_create(name="Music")
    Subject.objects.update_or_create(name="Art")


def seed_staff():
    users = [
        User(
            username="staff",
            email=fake.email(),
            password=make_password("staff"),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            is_staff=True,
        )
    ]
    for _ in range(TOTAL_STAFF):
        users.append(
            User(
                username=fake.user_name(),
                email=fake.email(),
                password=make_password(fake.password()),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                is_staff=True,
            )
        )
    bulk_create_users(users)


def seed_users():
    users = [
        User(
            username="user",
            password=make_password("user"),
            email=fake.email(),
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            is_staff=False,
        )
    ]
    for _ in range(TOTAL_USERS):
        users.append(
            User(
                username=fake.user_name(),
                email=fake.email(),
                password=make_password(fake.password()),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
            )
        )

    bulk_create_users(users)


def seed_classes():
    classes = []
    total_teacher = User.objects.count()
    for _ in range(TOTAL_CLASSES):
        classes.append(
            Class(
                name=fake.license_plate(), teacher_id=fake.random_int(1, total_teacher)
            )
        )
    Class.objects.bulk_create(classes)


def seed_students():
    students = []
    total_classes = Class.objects.count()
    for _ in range(TOTAL_STUDENTS):
        students.append(
            Student(
                name=fake.name(),
                student_code=fake.random_int(100000, 999999),
                classroom_id=fake.random_int(1, total_classes),
            )
        )
    Student.objects.bulk_create(students)


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
                datetime=fake.date_time_between(
                    start_date=datetime(2022, 1, 1),
                    end_date=datetime(2024, 12, 23),
                ),
                duration=timedelta(minutes=fake.random_int(30, 180)),
            )
        )
    Test.objects.bulk_create(tests)

    for i, test in enumerate(Test.objects.all()):
        total_question = fake.random_int(MIN_QUESTION_PER_TEST, MAX_QUESTION_PER_TEST)
        question_ids = fake.random_sample(range(1, total_questions), total_question)
        QuestionInTestModel.objects.bulk_create(
            [
                QuestionInTestModel(test=test, question_id=question_id, order=order)
                for order, question_id in enumerate(question_ids, start=1)
            ]
        )


def seed_results():
    results = []
    student_results = []
    total_tests = Test.objects.count()
    total_students = Student.objects.count()
    total_classes = Class.objects.count()

    for _ in range(TOTAL_TESTS):
        test_id = fake.random_int(1, total_tests)
        teacher = User.objects.order_by("?")[0]
        classroom = Class.objects.order_by("?")[0]
        # Add classes to the result
        result = Result(test_id=test_id, teacher=teacher, classroom=classroom)
        results.append(result)

    Result.objects.bulk_create(results)

    for result in Result.objects.all():
        # Create student results
        class_student_count = fake.random_int(30, 60)
        students_in_classes = Student.objects.filter(classroom=result.classroom).order_by("?")[:class_student_count]
        for student in students_in_classes:
            score = fake.random_int(0, 10)
            note = fake.text() if fake.boolean(chance_of_getting_true=50) else None
            student_results.append(
                StudentResult(
                    student=student,
                    result=result,
                    score=score,
                    note=note,
                )
            )

    StudentResult.objects.bulk_create(student_results, ignore_conflicts=True)


def seed_roles():
    user_view = Permission(name="user:view")
    user_view.save()
    user_add = Permission(name="user:add")
    user_add.save()

    classroom_view = Permission(name="classroom:view")
    classroom_view.save()
    classroom_add = Permission(name="classroom:add")
    classroom_add.save()

    question_view = Permission(name="question:view")
    question_view.save()
    question_add = Permission(name="question:add")
    question_add.save()

    test_view = Permission(name="test:view")
    test_view.save()
    test_add = Permission(name="test:add")
    test_add.save()

    result_view = Permission(name="result:view")
    result_view.save()
    result_add = Permission(name="result:add")
    result_add.save()

    student_view = Permission(name="student:view")
    student_view.save()
    student_add = Permission(name="student:add")
    student_add.save()

    summary_view = Permission(name="summary:view")
    summary_view.save()

    config_view = Permission(name="config")
    config_view.save()

    admin = Role(name="admin")
    admin.save()
    admin.permissions.add(
        user_view,
        user_add,
        student_view,
        student_add,
        classroom_view,
        classroom_add,
        question_view,
        question_add,
        test_view,
        test_add,
        result_view,
        result_add,
        summary_view,
        config_view,
    )
    admin.save()

    staff = Role(name="staff")
    staff.save()
    staff.permissions.add(
        user_view,
        user_add,
        #
        classroom_view,
        classroom_add,
        #
        test_view,
        test_add,
        #
        question_view,
        question_add,
        #
        result_view,
        result_add,
        #
        student_view,
        student_add,
        #
        summary_view,
    )
    staff.save()

    user = Role(name="user")
    user.save()
    user.permissions.add(
        classroom_view,
        question_view,
        question_add,
        result_view,
        result_add,
        test_view,
        test_add,
        student_view,
        summary_view,
    )
    user.save()


def set_roles():
    admin = Role.objects.filter(name="admin").first()
    staff = Role.objects.filter(name="staff").first()
    user_role = Role.objects.filter(name="user").first()
    for user in User.objects.all():
        if user.is_superuser:
            user.roles.set([admin])
        elif user.is_staff:
            user.roles.set([staff])
        else:
            user.roles.set([user_role])

class Command(BaseCommand):
    def handle(self, *args, **options):
        try:
            print("Seed roles")
            seed_roles()
            print("seeding user")
            seed_users()
            print("seeding staff")
            seed_staff()
            print("seeding class")
            seed_classes()
            print("seeding student")
            seed_students()
            print("seeding difficulty")
            seed_difficulty()
            print("seeding subject")
            seed_subject()
            print("seeding question")
            seed_question()
            print("seeding test")
            seed_test()
            print("seeding results")
            seed_results()
            print("set roles")
            set_roles()
        except Exception as e:
            log.error(e)
            log.error("Seed data failed")
