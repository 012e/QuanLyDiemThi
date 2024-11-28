from django.contrib.auth.models import User
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

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
    
    def clean(self):
        # Ràng buộc: Giảng viên chỉ được giảng dạy tối đa 4 môn, qd 2
        teacher_classes_count = Class.objects.filter(teacher=self.teacher).count()
        if teacher_classes_count >= 4:
            raise ValidationError(
                _("Giảng viên không thể giảng dạy hơn 4 môn."),
                code="max_teacher_classes"
            )

        # Ràng buộc: Môn học chỉ có thể có 4 độ khó, qd 1
        allowed_difficulties = ['Dễ', 'Trung Bình', 'Phức Tạp', 'Khó']
        if self.difficulty.name not in allowed_difficulties:
            raise ValidationError(
                _("Độ khó không hợp lệ."),
                code="invalid_difficulty"
            )

    class Meta:
        ordering = ["name"]


class Student(models.Model):
    name = models.CharField(max_length=100)
    student_code = models.CharField(max_length=10)
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
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    semester = models.PositiveSmallIntegerField(null=False, blank=False)
    datetime = models.DateTimeField()
    duration = models.DurationField()
    questions = models.ManyToManyField(Question, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)

    def __str__(self):
        return f"{self.subject} - {self.semester} - {self.datetime}"

    class Meta:
        ordering = ["updated_at"]


class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=4, decimal_places=2)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE)
    note = models.TextField(null=True, blank=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    classes = models.ManyToManyField(Class)

    def clean(self):
        # Ràng buộc: Điểm số phải nằm trong khoảng từ 0 đến 10, qd 3
        if self.score < 0 or self.score > 10:
            raise ValidationError(
                _("Điểm số phải trong khoảng từ 0 đến 10."),
                code="invalid_score"
            )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "test"], name="unique_result")
        ]
        ordering = ["updated_at"]
