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
import { Class, ClassService, Student, StudentService } from '../../core/api';
import { noWhitespaceValidator } from '../../core/validators/no-whitespace.validator';
import { MessageService } from 'primeng/api';
import { ClassPickerComponent } from '../class-picker/class-picker.component';
import { Router } from '@angular/router';
import { Divider, DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-create-student',
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
    DropdownModule,
    DividerModule
  ],
  providers: [DialogService],
  templateUrl: './create-student.component.html',
  styleUrl: './create-student.component.css',
})
export class CreateStudentComponent implements OnInit, OnDestroy {
  student!: Student;
  classroom: Class | undefined;
  form!: FormGroup;
  public classPickerRef: DynamicDialogRef | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly studentService: StudentService,
    private readonly classService: ClassService,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService
  ) {}

  ngOnInit(): void {
    console.log('CreateStudentComponent init');
    this.form = this.fb.group({
      name: [
        undefined,
        [Validators.required, Validators.minLength(1), noWhitespaceValidator()],
      ],
      student_code: [undefined, [Validators.required]],
      classroom: [undefined, [Validators.required]],
      classroom_id: [undefined, [Validators.required]],
    });
  }

  public ngOnDestroy(): void {
    if (this.classPickerRef) {
      this.classPickerRef.close();
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

  public selectClass(): void {
    this.classPickerRef = this.dialogService.open(ClassPickerComponent, {
      header: 'Select Classroom',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        exceptClass: this.form.get('classroom')?.value || [],
      },
      baseZIndex: 10000,
    });

    this.classPickerRef.onClose.subscribe((classroom: Class) => {
      if (!classroom) {
        return;
      }
      this.classroom = classroom;
      this.form.get('classroom_id')?.setValue(classroom.id);
      this.form.get('classroom')?.setValue(classroom);
      this.showSuccess('Select classroom successfully');
    });
  }

  public submit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showError('Please fill in all required fields');
      return;
    }
    const formValue: Student = this.form.value;
    console.log(formValue.classroom_id);
    this.studentService.studentCreate(formValue).subscribe({
      next: (response) => {
        console.log(response);
        this.showSuccess('Student updated successfully');
        this.router.navigate(['/student']);
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed to update student');
        const response = error.error;
        for (const key in response) {
          const keyErrors = response[key];
          for (const keyError of keyErrors) {
            this.showError(`${this.toSentenceCase(key)}: ${keyError}`);
          }
        }
      },
    });
  }
}
