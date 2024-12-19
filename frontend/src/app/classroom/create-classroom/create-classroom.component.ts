import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Class, ClassService, User } from '../../core/api';
import { noWhitespaceValidator } from '../../core/validators/no-whitespace.validator';
import { MessageService } from 'primeng/api';
import { TeacherPickerComponent } from '../../core/components/teacher-picker/teacher-picker.component';
import { Router } from '@angular/router';
import { Divider, DividerModule } from 'primeng/divider';
@Component({
  selector: 'app-create-classroom',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    InputNumberModule,
    RadioButtonModule,
    TableModule,
    RippleModule,
    InputTextareaModule,
    DividerModule,
  ],
  providers: [DialogService],
  templateUrl: './create-classroom.component.html',
  styleUrl: './create-classroom.component.css',
})
export class CreateClassroomComponent implements OnInit, OnDestroy {
  classroom!: Class;
  teacher: User | undefined;
  form!: FormGroup;
  public teacherPickerRef: DynamicDialogRef | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly classService: ClassService,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [
        undefined,
        [Validators.required, Validators.minLength(1), noWhitespaceValidator()],
      ],
      teacher: [undefined, [Validators.required]],
      teacher_id: [undefined, [Validators.required]],
    });
  }

  public ngOnDestroy(): void {
    if (this.teacherPickerRef) {
      this.teacherPickerRef.close();
    }
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
      this.form.get('teacher_id')?.setValue(teacher.id);
      this.form.get('teacher')?.setValue(teacher);
      this.showSuccess('Select teacher successfully');
    });
  }

  public submit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showError('Please fill in all required fields');
      return;
    }
    const formValue: Class = this.form.value;
    console.log(formValue.teacher_id);
    this.classService.classCreate(formValue).subscribe({
      next: (response) => {
        console.log(response);
        this.showSuccess('Class created successfully');
        this.router.navigate(['/classroom']);
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed to create class');
      },
    });
  }
}
