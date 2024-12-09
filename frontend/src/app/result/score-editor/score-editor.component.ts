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
@Component({
  selector: 'app-score-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    DividerModule,
    ButtonModule,
    CalendarModule,
    TableModule,
    ConfirmDialogModule,
    InputTextareaModule,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './score-editor.component.html',
  styleUrl: './score-editor.component.css',
})
export class ScoreEditorComponent implements OnInit {
  public scoreForm!: FormGroup;
  // public instance: DynamicDialogComponent | undefined;
  // public exceptStudents!: Array<number>;

  constructor(
    public dialogRef: DynamicDialogRef,
    private readonly fb: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly studentService: StudentService,
    private readonly resultsService: StudentresultService,

    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {
    // this.instance = this.dialogService.getInstance(this.dialogRef);
  }

  // private readonly DEFAULT_PAGE_SIZE = 10;

  public students: Student[] = [];
  // public student!: Student;

  // selectedStudents!: Student[];

  submitted: boolean = false;
  searchValue: string | undefined;

  // public count!: number;
  // public first: number = 0;
  // public rows: number = this.DEFAULT_PAGE_SIZE;
  // public searchText: string = '';

  // private searchText$ = new RxSubject<string>();

  public ngOnInit(): void {
    this.loadData();
    // this.initParams();
    this.initForm();
  }

  // public initParams(): void {
  //   if (!this.instance) {
  //     throw new Error('Instance is not defined');
  //   }
  //   const data = this.instance.data;
  //   if (!data) {
  //     throw new Error('Data is not defined');
  //   }
  //   // TODO: implements exceptions
  //   this.exceptStudents = data.questionExceptions;
  // }

  public initForm(): void {
    this.scoreForm = this.fb.group({
      id: [undefined],
      student: [null, Validators.required],
      result: [null, [Validators.required]],
      score: [null, Validators.required],
      note: [null],
    });
  }

  // public resetPage() {
  //   this.first = 0;
  // }

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
      result: data.result,
      score: data.score,
      note: data.note,
    };
    return result;
  }

  public submit(): void {
    this.scoreForm.markAllAsTouched();
    if (this.scoreForm.invalid) {
      this.showError('Form is not valid, please check the fields.');
      return;
    }
    this.resultsService.studentresultUpdate(this.getFormValue().id, this.getFormValue()).subscribe({
      next: (response) => {
        this.showSuccess('Result created successfully');
        this.dialogRef.close();
      },
      error: (error) => {
        this.showError(`Failed to create result: ${error.message}`);
      },
    });
  }

  // public onPage(event: TablePageEvent): void {
  //   this.first = event.first;
  //   this.rows = event.rows;
  //   this.updatePage();
  // }

  // public updatePage(): void {
  //   this.studentService
  //     .studentList(this.rows, this.first, undefined) //this.searchText
  //     .subscribe((data) => {
  //       this.students = data.results;
  //       this.count = data.count;
  //     });
  // }

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

  // public getDifficultyLabelById(index: number) {
  //   return this.difficulties.find((difficulty) => difficulty.id === index)
  //     ?.name;
  // }

  // public getSubjectLabelById(index: number) {
  //   return this.subjects.find((subject) => subject.id === index)?.name;
  // }

  public getValue(event: Event) {
    return (event.target as HTMLInputElement).value;
  }

  // public handleSearch(query: string) {
  //   this.searchText$.next(query);
  // }

  // public canSubmit(): boolean {
  //   if (!this.selectedStudents || !this.selectedStudents.length) {
  //     return false;
  //   }
  //   return true;
  // }

  // public submit(): void {
  //   const selectedStudents = this.selectedStudents.map(
  //     (question) => question.id
  //   );
  //   this.dialogRef.close(selectedStudents);
  // }
}
