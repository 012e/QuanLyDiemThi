import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
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
@Component({
  selector: 'app-student-result-picker',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    InputTextModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './student-result-picker.component.html',
  styleUrl: './student-result-picker.component.css'
})
export class StudentResultPickerComponent implements OnInit {
  public instance: DynamicDialogComponent | undefined;
  public exceptStudentResults!: Array<number>;

  constructor(
    public dialogRef: DynamicDialogRef,
    private readonly dialogService: DialogService,
    private readonly studentService: StudentService,
    private readonly studentResultService: StudentresultService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) {
    this.instance = this.dialogService.getInstance(this.dialogRef);
  }

  private readonly DEFAULT_PAGE_SIZE = 10;

  studentResults!: StudentResult[];
  studentResult!: StudentResult;

  selectedStudentResult!: StudentResult[];

  students!: Student[];
  student!: Student;

  submitted: boolean = false;
  searchValue: string | undefined;

  public count!: number;
  public first: number = 0;
  public rows: number = this.DEFAULT_PAGE_SIZE;
  public searchText: string = '';

  private searchText$ = new RxSubject<string>();

  public ngOnInit(): void {
    this.loadInitialData();
    this.initParams();
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
    this.exceptStudentResults = data.studentResultExceptions;
  }

  public resetPage() {
    this.first = 0;
  }

  private loadInitialData() {
    this.searchText$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query: string) => {
        this.resetPage();
        this.searchText = query;
        this.updatePage();
      });

    this.updatePage();

    this.studentService.studentList().subscribe((students) => {
      this.students = students.results;
    });
  }

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    this.studentResultService
      .studentresultList(this.rows, this.first, undefined) //this.searchText
      .subscribe((data) => {
        this.studentResults = data.results;
        this.count = data.count;
      });
  }

  public clearSelectedStudentResults() {
    this.selectedStudentResult = [];
  }

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

  public getStudentLabelById(index: number) {
    return this.students.find((student) => student.id === index)?.name;
  }

  public getStudentIDById(index: number) {
    return this.students.find((student) => student.id === index)?.student_code;
  }

  public getValue(event: Event) {
    return (event.target as HTMLInputElement).value;
  }

  public handleSearch(query: string) {
    this.searchText$.next(query);
  }

  public canSubmit(): boolean {
    if (!this.selectedStudentResult || !this.selectedStudentResult.length) {
      return false;
    }
    return true;
  }

  public submit(): void {
    const selectedStudentResult = this.selectedStudentResult.map(
      (studentResult) => studentResult.id,
    );
    this.dialogRef.close(selectedStudentResult);
  }
}
