import { Component, OnInit } from '@angular/core';
import { StandaloneStudentResult, StudentresultService } from '../../core/api';
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

@Component({
  selector: 'app-result-student-edit',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './result-student-edit.component.html',
  styleUrl: './result-student-edit.component.css',
})
export class ResultStudentEditComponent implements OnInit {
  result!: StandaloneStudentResult;

  instance: DynamicDialogComponent | undefined;
  form!: FormGroup;

  constructor(
    public dialogRef: DynamicDialogRef,
    private readonly studentresultService: StudentresultService,
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly messageService: MessageService,
  ) {
    this.instance = this.dialogService.getInstance(this.dialogRef);
  }

  initParams(): void {
    if (!this.instance) {
      throw new Error('Instance is not defined');
    }
    const data = this.instance.data;
    if (!data) {
      throw new Error('Data is not defined');
    }
    this.result = data.result;
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      score: [this.result.score, [Validators.required, floatValidator()]],
      student_id: [this.result.student.id, [Validators.required]],
      note: [this.result.note],
    });
  }

  ngOnInit(): void {
    this.initParams();
    this.initForm();
  }

  submit(): void {
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
    this.studentresultService
      .studentresultUpdate(this.result.id, studentResult)
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
