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
import { Student, StudentService } from '../../core/api';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-student-picker',
  standalone: true,
  imports: [ButtonModule, TableModule, InputTextModule],
  templateUrl: './student-picker.component.html',
  styleUrl: './student-picker.component.css',
})
export class StudentPickerComponent implements OnInit {
  public instance: DynamicDialogComponent | undefined;

  constructor(
    public dialogRef: DynamicDialogRef,
    private readonly dialogService: DialogService,
    private readonly studentService: StudentService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {
    this.instance = this.dialogService.getInstance(this.dialogRef);
  }

  private readonly DEFAULT_PAGE_SIZE = 10;

  students!: Student[];
  student!: Student;
  selectedStudents!: Student[];
  classId!: number;

  submitted: boolean = false;
  searchValue: string | undefined;

  public count!: number;
  public first: number = 0;
  public rows: number = this.DEFAULT_PAGE_SIZE;
  public searchText: string = '';

  private searchText$ = new RxSubject<string>();

  public ngOnInit(): void {
    this.initParams();
    this.loadInitialData();
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
    this.classId = data.classId
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
  }

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    console.log(this.classId)
    this.studentService
      .studentList(this.rows, this.first, undefined, this.searchText, this.classId)
      .subscribe((data) => {
        this.students = data.results;
        this.count = data.count;
      });
  }

  public clearSelectedStudents() {
    this.selectedStudents = [];
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

  public getValue(event: Event) {
    return (event.target as HTMLInputElement).value;
  }

  public handleSearch(query: string) {
    this.searchText$.next(query);
  }

  public canSubmit(): boolean {
    if (!this.selectedStudents || !this.selectedStudents.length) {
      return false;
    }
    return true;
  }

  public submit(): void {
    this.dialogRef.close(this.selectedStudents);
  }
}
