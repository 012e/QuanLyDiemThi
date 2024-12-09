import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';

import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Subject as RxSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  Student,
  StudentService,
  StudentResult,
  StudentresultService,
} from '../../core/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';


@Component({
  selector: 'app-score-create',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    InputTextModule,
    ReactiveFormsModule,
    DropdownModule,
    CardModule,
    FloatLabelModule,
    DividerModule,
    CalendarModule,
    ConfirmDialogModule,
    InputTextareaModule,
    InputNumberModule,
  ],

  providers: [ConfirmationService, MessageService],
  templateUrl: './score-create.component.html',
  styleUrl: './score-create.component.css',
})
export class ScoreCreateComponent implements OnInit {
  public scoreForm!: FormGroup;
  public instance: DynamicDialogComponent | undefined;
  public resultId!: number;

  constructor(
    public dialogRef: DynamicDialogRef,
    private readonly fb: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly studentService: StudentService,
    private readonly resultsService: StudentresultService,

    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {
    this.instance = this.dialogService.getInstance(this.dialogRef);
  }

  public students: Student[] = [];

  submitted: boolean = false;
  searchValue: string | undefined;

  public ngOnInit(): void {
    this.loadData();
    this.initParams();
    this.initForm();
  }

  public initParams(): void {
    if (!this.instance) {
      throw new Error('Instance is not defined');
    }
    const data = this.instance.data;
    if (!data) {
      throw new Error('Data is not defined');
    }
    // TODO: implements exceptions
    this.resultId = data.resultId;
    
  }

  public initForm(): void {
    this.scoreForm = this.fb.group({
      id: [undefined],
      student: [null, Validators.required],
      score: [null, Validators.required],
      note: [null],
    });
  }

  private loadData() {
    this.studentService.studentList().subscribe((students) => {
      this.students = students.results;
    });
  }

  public getFormValue(): StudentResult {
    const data = this.scoreForm.value;
    const result: StudentResult = {
      id: data.id,
      student: data.student,
      result: this.resultId,
      score: data.score,
      note: data.note,
    };
    console.log(result);
    return result;
  }

  public submit(): void {
    this.scoreForm.markAllAsTouched();
    if (this.scoreForm.invalid) {
      this.showError('Form is not valid, please check the fields.');
      return;
    }
    this.resultsService.studentresultCreate(this.getFormValue()).subscribe({
      next: (response) => {
        this.showSuccess('Result created successfully');
      },
      error: (error) => {
        console.log(error);
        this.showError(`Failed to create result: ${error.message}`);
      },
    });
   
  }

  // public clearSelectedStudents() {
  //   this.selectedStudents = [];
  // }

  public showError(error: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error,
      life: 3000,
    });
  }

  public showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail: message,
      life: 3000,
    });
  }

  // public submit(): void {
  //   const selectedStudents = this.selectedStudents.map(
  //     (question) => question.id
  //   );
  //   this.dialogRef.close(selectedStudents);
  // }
}
