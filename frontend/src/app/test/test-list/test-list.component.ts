import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Test, TestService, SubjectService, Subject } from '../../core/api';
import { DatePipe } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule, UploadEvent } from 'primeng/fileupload';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  Subject as RxSubject,
} from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';
import { SecondsToHhmmssPipe } from '../../core/pipes/seconds-to-hhmmss.pipe';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    TableModule,
    DatePipe,
    DividerModule,
    SkeletonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    SecondsToHhmmssPipe,
    FileUploadModule,
    ToastModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './test-list.component.html',
  styleUrl: './test-list.component.css',
})
export class TestListComponent implements OnInit, OnDestroy {
  constructor(
    private readonly router: Router,
    private readonly testService: TestService,
    private readonly subjectService: SubjectService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  public tests!: Test[];
  public subjects!: Subject[];
  public count!: number;
  public selectedTests: Test[] = [];

  public first: number = 0;
  public rows: number = 15;
  public isLoading: boolean = false;

  public searchText: string = '';
  private searchText$ = new RxSubject<string>();

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    this.isLoading = true;
    this.testService
      .testList(this.rows, this.first, undefined, this.searchText)
      .subscribe((data) => {
        this.tests = data.results;
        this.count = data.count;
        this.isLoading = false;
      });
  }

  public ngOnDestroy(): void {
    this.searchText$.unsubscribe();
  }

  public ngOnInit(): void {
    this.searchText$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query: string) => {
        this.first = 0;
        this.searchText = query;
        this.updatePage();
      });
    this.updatePage();

    this.subjectService.subjectList().subscribe((data) => {
      this.subjects = data;
    });
  }

  public clearSelectedTests(): void {
    this.selectedTests = [];
  }

  public deleteSelectedTests(): void {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the selected tests? (' +
        this.selectedTests?.length +
        ' selected)',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.selectedTests) {
          return;
        }

        const delete$ = this.selectedTests.map((test) =>
          this.testService.testDestroy(test.id).pipe(
            map(() => ({ id: test.id, success: true })),
            catchError(() => {
              this.showError(`Failed to delete test with id ${test.id}`);
              return of({ id: test.id, success: false });
            })
          )
        );

        forkJoin(delete$).subscribe({
          next: (results) => {
            console.log(results);
            this.updatePage();
            this.clearSelectedTests();
            this.showSuccess(
              `Successfully deleted ${results.length} ${
                results.length === 1 ? 'test' : 'tests'
              }.`
            );
          },
          error: (error) => {
            this.showError(`Failed to delete some tests.`);
          },
        });
      },
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

  public showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 3000,
    });
  }

  public handleSearch(text: string): void {
    this.searchText$.next(text);
  }

  public getValue(event: Event) {
    return (event.target as HTMLInputElement).value;
  }

  public deleteTest(test: Test): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete test with id ${test.id}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.testService.testDestroy(test.id).subscribe({
          next: (value) => {
            this.updatePage();
            if (this.selectedTests.includes(test)) {
              this.selectedTests = this.selectedTests.filter(
                (selected) => selected !== test
              );
            }
            this.showSuccess(`Successfully deleted test with id ${test.id}`);
          },
          error: (error) => {
            this.showError(
              `Failed to delete test with id ${test.id}: ${error.message}`
            );
          },
        });
      },
    });
  }
  public editTest(test: Test): void {
    this.router.navigate(['/test', test.id]);
  }
  public createNew(): void {
    this.router.navigate(['/test/new']);
  }

  public getSubjectLabelById(index: number): string {
    return this.subjects.find((subject) => subject.id === index)?.name || '';
  }

  public onBasicUploadAuto(event: UploadEvent) {
    this.messageService.add({
      severity: 'info',
      summary: 'Success',
      detail: 'File Uploaded with Auto Mode',
    });

    console.log('test: ',event)
  }
}
