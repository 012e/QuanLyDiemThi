import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ResultService,
  StandaloneStudentResult,
  Student,
  StudentresultService,
} from '../../core/api';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { floatValidator } from '../../core/validators/is-float-validator';
import { ButtonModule } from 'primeng/button';
import { Utils } from '../../core/utils/utils';
import { StudentPickerComponent } from '../../core/components/student-picker/student-picker.component';

@Component({
  selector: 'app-result-student-create',
  standalone: true,
  imports: [InputTextModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './result-student-create.component.html',
  styleUrl: './result-student-create.component.css',
})
export class ResultStudentCreateComponent implements OnInit, OnDestroy {
  resultId!: number;

  studentPicker: DynamicDialogRef | undefined;

  student: Student | undefined;

  instance: DynamicDialogComponent | undefined;
  form!: FormGroup;

  constructor(
    public dialogRef: DynamicDialogRef,
    private readonly studentresultService: StudentresultService,
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly messageService: MessageService,
    private readonly resultService: ResultService,
  ) {
    this.instance = this.dialogService.getInstance(this.dialogRef);
  }

  ngOnDestroy(): void {
    if (this.studentPicker) {
      this.studentPicker.close();
    }
  }

  initParams(): void {
    if (!this.instance) {
      throw new Error('Instance is not defined');
    }
    const data = this.instance.data;
    if (!data) {
      throw new Error('Data is not defined');
    }
    if (!data.resultId) {
      throw new Error('Data.result is not defined');
    }
    this.resultId = data.resultId;
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      score: [undefined, [Validators.required, floatValidator()]],
      student_id: [undefined, [Validators.required]],
      note: [undefined],
    });
  }

  ngOnInit(): void {
    this.initParams();
    this.initForm();
  }

  pickStudent(): void {
    this.studentPicker = this.dialogService.open(StudentPickerComponent, {
      header: 'Select a teacher',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        description: 'Select a student to add a result',
      },
      baseZIndex: 10000,
    });
    this.studentPicker.onClose.subscribe((student: Student) => {
      this.student = student;
      if (student) {
        this.form.get('student_id')?.setValue(student.id);
        this.student = student;
      } else {
        this.form.get('student_id')?.setValue(undefined);
        this.student = undefined;
      }
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Form is invalid, please check all the fields.',
      });
      return;
    }
    const studentResult: StandaloneStudentResult = {
      ...this.form.value,
      note: this.form.value.note || null,
    };
    this.resultService
      .resultDetailCreate(this.resultId, studentResult)
      .subscribe({
        next: (result) => {
          this.dialogRef.close(result);
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: Utils.prettyError(error.error),
          });
        },
      });
  }
}
