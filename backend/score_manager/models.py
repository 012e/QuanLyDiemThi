from django.db import models
from django.contrib.auth.models import User
from rest_framework.compat import md_filter_add_syntax_highlight

User._meta.get_field("email")._unique = True  # pyright: ignore


class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return str(self.name)


class Class(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.name)


class Student(models.Model):
    name = models.CharField(max_length=100)
    classes = models.ManyToManyField(Class)
    student_code = models.CharField(max_length=10)

    def __str__(self):
        return str(self.name)


class Difficulty(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return str(self.name)


class Question(models.Model):
    detail = models.TextField(blank=False, null=True)
    difficulty = models.ForeignKey(Difficulty, null=False, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.detail)

    class Meta:
        verbose_name = "Question"
        verbose_name_plural = "Questions"


class Test(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    semester = models.PositiveSmallIntegerField(null=False, blank=False)
    datetime = models.DateTimeField()
    duration = models.DurationField()

    def __str__(self):
        return f"{self.subject} - {self.semester} - {self.datetime}"


class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=4, decimal_places=2)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE)
    note = models.TextField(null=True, blank=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "test"], name="unique_result")
        ]
