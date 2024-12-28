import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  Class,
  ResultService,
  SafeUser,
  Subject,
  SubjectService,
  Test,
  User,
} from '../../core/api';
import { ClassPickerComponent } from '../../core/components/class-picker/class-picker.component';
import { TeacherPickerComponent } from '../../core/components/teacher-picker/teacher-picker.component';
import { TestPickerComponent } from '../../core/components/test-picker/test-picker.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-result-create',
  standalone: true,
  imports: [
    DividerModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextModule,
    CalendarModule,
    TableModule,
    CheckboxModule,
    DialogModule,
    ReactiveFormsModule,
    DatePipe,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './result-create.component.html',
  styleUrl: './result-create.component.css',
})
export class ResultCreateComponent implements OnInit, OnDestroy {
  editing: boolean = false;

  teacherPicker: DynamicDialogRef | undefined;
  classroomPicker: DynamicDialogRef | undefined;
  testPicker: DynamicDialogRef | undefined;

  teacher: SafeUser | undefined;
  test: Test | undefined;
  classroom: Class | undefined;

  subjects!: Subject[];
  form!: FormGroup;

  constructor(
    private readonly dialogService: DialogService,
    private readonly subjectService: SubjectService,
    private readonly messageService: MessageService,
    private readonly resultService: ResultService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
  ) {}

  public ngOnDestroy(): void {
    if (this.teacherPicker) {
      this.teacherPicker.close();
    }
    if (this.testPicker) {
      this.testPicker.close();
    }
    if (this.classroomPicker) {
      this.classroomPicker.close();
    }
  }

  public initForm(): void {
    this.form = this.fb.group({
      test_id: [undefined, Validators.required],
      teacher_id: [undefined, Validators.required],
      classroom_id: [undefined, Validators.required],
    });
  }

  public initData(): void {
    this.subjectService.subjectList().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        this.showError('Failed to load subjects');
      },
    });
  }

  public ngOnInit(): void {
    this.initForm();
    this.initData();
  }

  public selectTeacher(): void {
    this.teacherPicker = this.dialogService.open(TeacherPickerComponent, {
      header: 'Select a teacher',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        exceptTeacher: this.teacher ?? null,
        description: 'Select a teacher for the result',
      },
      baseZIndex: 10000,
    });
    this.teacherPicker.onClose.subscribe((teacher: User) => {
      if (!teacher) {
        return;
      }
      this.showSuccess('Select teacher successfully');
      this.form.get('teacher_id')?.setValue(teacher.id);
      this.teacher = teacher;
    });
  }

  public selectTest(): void {
    this.testPicker = this.dialogService.open(TestPickerComponent, {
      header: 'Select a Test',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        exceptTest: this.test ?? null,
        description: 'Select a test for the result',
      },
      baseZIndex: 10000,
    });
    this.testPicker.onClose.subscribe((test: Test) => {
      if (!test) {
        return;
      }
      this.showSuccess('Select test successfully');
      this.form.get('test_id')?.setValue(test.id);
      this.test = test;
    });
  }

  public selectClassroom(): void {
    this.classroomPicker = this.dialogService.open(ClassPickerComponent, {
      header: 'Select a Class',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        exceptClass: this.classroom ?? null,
        description: 'Select a class for the result',
      },
      baseZIndex: 10000,
    });
    this.classroomPicker.onClose.subscribe((classroom: Class) => {
      if (!classroom) {
        return;
      }
      this.showSuccess('Select class successfully');
      this.form.get('classroom_id')?.setValue(classroom.id);
      this.classroom = classroom;
    });
  }

  public submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showError('Invalid form, please check the fields.');
      return;
    }
    this.resultService.resultCreate(this.form.value).subscribe({
      next: (result) => {
        this.showSuccess('Result created successfully');
        this.router.navigate(['/result', result.id]);
      },
      error: (error) => {
        this.showError('Failed to create result');
      },
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  public getSubjectName(subject: number): string {
    return this.subjects.find((s) => s.id === subject)?.name ?? '';
  }
}