from django.contrib.auth.models import User
from django.db import models

User._meta.get_field("email")._unique = True  # pyright: ignore


class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return str(self.name)

    class Meta:
        ordering = ["name"]


class Class(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.name)

    class Meta:
        ordering = ["name"]


class Student(models.Model):
    name = models.CharField(max_length=100)
    student_code = models.CharField(max_length=10, blank=False, unique=True)
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    def __str__(self):
        return str(self.name)

    class Meta:
        ordering = ["updated_at"]


class Difficulty(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return str(self.name)

    class Meta:
        ordering = ["name"]

class Question(models.Model):
    detail = models.TextField(blank=False, null=True)
    difficulty = models.ForeignKey(Difficulty, null=False, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    def __str__(self):
        return str(self.detail)

    class Meta:
        verbose_name = "Question"
        verbose_name_plural = "Questions"
        ordering = ["updated_at"]


class Test(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, db_index=True)
    semester = models.PositiveSmallIntegerField(null=False, blank=False)
    datetime = models.DateTimeField()
    duration = models.DurationField()
    questions = models.ManyToManyField(Question, blank=True, through="QuestionInTestModel")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    def __str__(self):
        return f"{self.subject} - {self.semester} - {self.datetime}"

    class Meta:
        ordering = ["updated_at"]

class QuestionInTestModel(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, db_index=True, blank=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, db_index=True, blank=False)
    order = models.PositiveSmallIntegerField(null=False)
    class Meta:
        ordering = ["order", "question"]



class Result(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        ordering = ["updated_at"]


class StudentResult(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, db_index=True)
    result = models.ForeignKey(Result, on_delete=models.CASCADE, db_index=True)
    score = models.DecimalField(max_digits=4, decimal_places=2)
    note = models.TextField(null=True, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "result"], name="unique_student_result"
            )
        ]
        ordering = ["updated_at"]
