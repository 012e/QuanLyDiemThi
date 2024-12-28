import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Subject as RxSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Subject, SubjectService, Test, TestService, User } from '../../api';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-test-picker',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    InputTextModule,
    DatePipe,
  ],
  templateUrl: './test-picker.component.html',
  styleUrl: './test-picker.component.css',
})
export class TestPickerComponent {
  instance: DynamicDialogComponent | undefined;
  exceptTest!: Test;
  subjects: Subject[] = [];

  constructor(
    public dialogRef: DynamicDialogRef,
    private readonly dialogService: DialogService,
    private readonly testService: TestService,
    private readonly messageService: MessageService,
    private readonly subjectService: SubjectService,
  ) {
    this.instance = this.dialogService.getInstance(this.dialogRef);
  }

  private readonly DEFAULT_PAGE_SIZE = 10;

  tests!: Test[];

  submitted: boolean = false;
  searchValue: string | undefined;
  description: string = '';

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
    this.exceptTest = data.exceptTest;
    this.description = data.description;
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
    this.subjectService.subjectList().subscribe({
      next: (data) => {
        this.subjects = data;
      },
      error: (error) => {
        this.showError('Failed to load subjects');
      },
    });

    this.updatePage();
  }

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    this.testService
      .testList(this.rows, this.first, undefined, this.searchText)
      .subscribe((data) => {
        this.tests = data.results;
        this.count = data.count;
      });
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

  public select(teacher: User): void {
    console.log(`Selected teacher ${teacher.id}`);
    this.dialogRef.close(teacher);
  }

  public getSubjectName(subjectId: number): string {
    return (
      this.subjects.find((subject) => subject.id === subjectId)?.name ?? ''
    );
  }
}
