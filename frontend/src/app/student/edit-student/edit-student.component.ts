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
import { Class, ClassService, Student, StudentService } from '../../core/api';
import { noWhitespaceValidator } from '../../core/validators/no-whitespace.validator';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassPickerComponent } from '../class-picker/class-picker.component';
import { Divider, DividerModule } from 'primeng/divider';
@Component({
  selector: 'app-edit-student',
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
  templateUrl: './edit-student.component.html',
  styleUrl: './edit-student.component.css',
})
export class EditStudentComponent implements OnInit, OnDestroy {
  studentId!: number;
  student!: Student;
  form!: FormGroup;
  classroom: Class | undefined;
  public classPickerRef: DynamicDialogRef | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly studentService: StudentService,
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
      student_code: [undefined, [Validators.required]],
      classroom: [undefined, [Validators.required]],
      classroom_id: [undefined, [Validators.required]],
    });
    this.studentId = this.getStudentId();

    this.studentService.studentRetrieve(this.studentId).subscribe((data) => {
      this.form.patchValue({
        ...data,
        classroom_id: data.classroom.id,
      });

      console.log(this.form.value);

      this.classService
        .classRetrieve((data as any).classroom.id)
        .subscribe((data) => {
          this.classroom = data;
        });
    });
  }

  public ngOnDestroy(): void {
    if (this.classPickerRef) {
      this.classPickerRef.close();
    }
  }

  private getStudentId(): number {
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

  public selectClass(): void {
    this.classPickerRef = this.dialogService.open(ClassPickerComponent, {
      header: 'Select Questions',
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
      this.showSuccess('Select class successfully');
      this.form.get('classroom_id')?.setValue(classroom.id);
      this.form.get('classroom')?.setValue(classroom);
    });
  }

  public submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.showError('Please fill in all required fields');
      return;
    }

    const formValue: Student = this.form.value;
    console.log(this.form.value);
    this.studentService.studentUpdate(this.studentId, formValue).subscribe({
      next: (response) => {
        console.log(response);
        this.showSuccess('Student updated successfully');
        this.router.navigate(['/student']);
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed to update student');
      },
    });
  }
}
