import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Class, ClassService, User, UserService } from '../../core/api';
import { noWhitespaceValidator } from '../../core/validators/no-whitespace.validator';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherPickerComponent } from '../teacher-picker/teacher-picker.component';
import { Divider, DividerModule } from 'primeng/divider';
@Component({
  selector: 'app-edit-classroom',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    RippleModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    InputTextareaModule,
    CommonModule,
    DropdownModule,
    RadioButtonModule,
    InputTextModule,
    FormsModule,
    InputNumberModule,
    ReactiveFormsModule,
    NgxPermissionsModule,
    DividerModule,
  ],
  providers: [DialogService],
  templateUrl: './edit-classroom.component.html',
  styleUrl: './edit-classroom.component.css',
})
export class EditClassroomComponent implements OnInit, OnDestroy {
  classId!: number;
  classroom!: Class;
  form!: FormGroup;
  teacher: User | undefined;
  public teacherPickerRef: DynamicDialogRef | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly teacherService: UserService,
    private readonly classService: ClassService,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [undefined],
      name: [
        undefined,
        [Validators.required, Validators.minLength(1), noWhitespaceValidator()],
      ],
      teacher: [undefined, [Validators.required]],
      teacher_id: [undefined, [Validators.required]],
    });
    this.classId = this.getClassId();

    this.classService.classRetrieve(this.classId).subscribe((data) => {
      this.form.patchValue({
        ...data,
        teacher_id: data.teacher.id,
      });

      console.log(this.form.value);

      this.teacherService
        .userRetrieve((data as any).teacher.id)
        .subscribe((data) => {
          this.teacher = data;
        });
    });
  }

  public ngOnDestroy(): void {
    if (this.teacherPickerRef) {
      this.teacherPickerRef.close();
    }
  }

  private getClassId(): number {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = Number(idStr);
    if (!idStr || isNaN(Number(idStr))) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid test id',
      });
      this.router.navigate(['/']);
    }
    return id;
  }

  private toSentenceCase(input: string): string {
    if (!input) return ''; // Handle empty string or null
    input = input.trim(); // Remove leading and trailing whitespace
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
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

  public selectTeacher(): void {
    this.teacherPickerRef = this.dialogService.open(TeacherPickerComponent, {
      header: 'Select Teacher',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        exceptTeacher: this.form.get('teacher')?.value || [],
      },
      baseZIndex: 10000,
    });

    this.teacherPickerRef.onClose.subscribe((teacher: User) => {
      if (!teacher) {
        return;
      }

      this.teacher = teacher;
      this.showSuccess('Select teacher successfully');
      this.form.get('teacher_id')?.setValue(teacher.id);
      this.form.get('teacher')?.setValue(teacher);
    });
  }

  public submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.showError('Please fill in all required fields');
      return;
    }

    const formValue: Class = this.form.value;
    console.log(this.form.value);
    this.classService.classUpdate(this.classId, formValue).subscribe({
      next: (response) => {
        console.log(response);
        this.showSuccess('Class updated successfully');
        this.router.navigate(['/classroom']);
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed to update classroom');
      },
    });
  }
}
