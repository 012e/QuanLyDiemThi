import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Class, Result, ResultService, SafeUser, Subject, SubjectService, Test, User } from '../../core/api';
import { ClassPickerComponent } from '../../core/components/class-picker/class-picker.component';
import { TeacherPickerComponent } from '../../core/components/teacher-picker/teacher-picker.component';
import { TestPickerComponent } from '../../core/components/test-picker/test-picker.component';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ResultStudentListComponent } from '../result-student-list/result-student-list.component';
import { DialogModule } from 'primeng/dialog';
import { NgxPermissionsModule } from 'ngx-permissions';

@Component({
  selector: 'app-result-edit',
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
    ResultStudentListComponent,
    DatePipe,
    NgxPermissionsModule
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './result-edit.component.html',

  styleUrl: './result-edit.component.css',
})
export class ResultEditComponent implements OnInit, OnDestroy {
  resultId: number | undefined;
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
    private readonly confirmationService: ConfirmationService,
    private readonly subjectService: SubjectService,
    private readonly route: ActivatedRoute,
    private readonly messageService: MessageService,
    private readonly resultService: ResultService,
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
    this.form.disable();
  }

  public initData(): void {
    this.resultId = +this.route.snapshot.params['id'];
    this.subjectService.subjectList().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
      },
      error: (error) => {
        this.showError('Failed to load subjects');
      },
    })
    this.resultService.resultRetrieve(this.resultId).subscribe({
      next: (result) => {
        this.form.patchValue({
          test_id: result.test.id,
          teacher_id: result.teacher.id,
          classroom_id: result.classroom.id,
        });
        this.teacher = result.teacher;
        this.classroom = result.classroom;
        this.test = result.test;
      },
      error: (error) => {
        this.showError('Failed to load result');
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
        description: "Select a teacher for the result",
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
        description: "Select a test for the result",
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
        description: "Select a class for the result",
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

  public enableEditing(): void {
    this.editing = true;
    this.form.enable();
  }

  public disableEditing(): void {
    this.editing = false;
    this.form.disable();
  }

  public submit(): void {
    this.form.markAllAsTouched();

    console.log(this.form.value);
    if (this.form.invalid) {
      this.showError('Invalid form, please check the fields.');
      return;
    }
    const result = this.form.value as Result;
    this.resultService.resultUpdate(this.resultId!, result).subscribe({
      next: (result) => {
        this.showSuccess('Result updated successfully');
        this.disableEditing();
      },
      error: (error) => {
        this.showError('Failed to update result');
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
