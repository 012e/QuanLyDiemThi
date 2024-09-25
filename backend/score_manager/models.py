from django.db import models
from django.contrib.auth.models import AbstractUser


class Difficulty(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return str(self.name)


class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return str(self.name)


class Teacher(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return str(self.name)


class Class(models.Model):
    name = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.name)


class Student(models.Model):
    name = models.CharField(max_length=100)
    classes = models.ManyToManyField(Class)

    def __str__(self):
        return str(self.name)


class Question(models.Model):
    question = models.TextField()
    difficulty = models.ForeignKey(Difficulty, on_delete=models.CASCADE)
    detail = models.TextField(blank=False, null=True)

    def __str__(self):
        return str(self.question)

    class Meta:
        verbose_name = "Question"
        verbose_name_plural = "Questions"


class Test(models.Model):
    questions = models.ManyToManyField(Question)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    semester = models.PositiveSmallIntegerField()
    datetime = models.DateTimeField()

    def __str__(self):
        return f"{self.subject} - {self.semester} - {self.datetime}"


class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=4, decimal_places=2)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    note = models.TextField(null=True, blank=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "test"], name="unique_result")
        ]
