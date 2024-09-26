from django.db import models
from django.utils import choices


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
    student_code = models.CharField(max_length=10)

    def __str__(self):
        return str(self.name)


DIFFICULTY_CHOICES = {
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard",
    "hehe": "Hehe",
}


class Question(models.Model):
    question = models.TextField()
    detail = models.TextField(blank=False, null=True)
    difficulty = models.CharField(max_length=100, choices=DIFFICULTY_CHOICES.items())
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.question)

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
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    note = models.TextField(null=True, blank=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "test"], name="unique_result")
        ]
