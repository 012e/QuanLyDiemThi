import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  ],
  templateUrl: './create-student.component.html',
  styleUrl: './create-student.component.css'
})
export class CreateStudentComponent implements OnInit {
  student!: Student;
  classes!: Class[];
  form!: FormGroup;
  self: DynamicDialogComponent | undefined;

  constructor(
    private readonly fb: FormBuilder,
    private readonly studentService: StudentService,
    private readonly classService: ClassService,
    private readonly messageService: MessageService,
    dialogService: DialogService,
    public selfRef: DynamicDialogRef,
  ) {
    this.self = dialogService.getInstance(selfRef);
  }

  ngOnInit(): void {
    console.log('CreateStudentComponent init');
    this.form = this.fb.group({
      name: [
        undefined,
        [Validators.required, Validators.minLength(1), noWhitespaceValidator()],
      ],
      student_code: [undefined, [Validators.required]],
      class_id: [undefined, [Validators.required]],
    });
    // this.loadData();
  }

  // private loadData() {
  //   this.classService.classList().subscribe({
  //     next: (response) => {
  //       this.classes = response.results;
  //     },
  //     error: (error) => {
  //       console.error(error);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Failed to load classes',
  //       });
  //     },
  //   });
  // }

  private closeWithSuccess(student: Student) {
    this.selfRef.close(student);
  }

  private toSentenceCase(input: string): string {
    if (!input) return ''; // Handle empty string or null
    input = input.trim(); // Remove leading and trailing whitespace
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  }

  public submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Form is invalid, please check the form.',
      });
      return;
    }
    const formValue: Student = this.form.value;
    this.studentService.studentCreate(formValue).subscribe({
      next: (response) => {
        console.log(response);
        this.closeWithSuccess(response);
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update student',
        });
        const response = error.error;
        for (const key in response) {
          const keyErrors = response[key];
          for (const keyError of keyErrors) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `${this.toSentenceCase(key)}: ${this.toSentenceCase(keyError)}`,
            });
          }
        }
      },
    });
  }
}
