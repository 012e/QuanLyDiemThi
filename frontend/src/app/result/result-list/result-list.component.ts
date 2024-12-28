import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { TableModule, TablePageEvent } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { Subject as RxSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Result, ResultService, SubjectService, Subject } from '../../core/api';
import { Router } from '@angular/router';
import { NgxPermissionsModule } from 'ngx-permissions';

@Component({
  selector: 'app-result-list',
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
  ],
  providers: [ConfirmationService],
  templateUrl: './result-list.component.html',
  styleUrl: './result-list.component.css',
})
export class ResultListComponent implements OnInit {
  private readonly DEFAULT_PAGE_SIZE = 10;

  results!: Result[];
  result!: Result;

  subjects!: Subject[];

  selectedResults!: Result[];

  submitted = false;
  searchValue: string | undefined;

  public count!: number;
  public first = 0;
  public rows: number = this.DEFAULT_PAGE_SIZE;
  public searchText = '';
  public loading = false;

  private searchText$ = new RxSubject<string>();

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly subjectService: SubjectService,
    private readonly resultService: ResultService,
    private readonly router: Router,
  ) {}

  public resetPage() {
    this.first = 0;
  }

  public ngOnInit() {
    this.loadInitialData();
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
    this.loading = true;
    this.resultService
      .resultList(this.rows, this.first, undefined, this.searchText)
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.results = data.results;
          this.count = data.count;
        },
        error: (error) => {
          this.loading = false;
          console.error(error);
        },
      });
  }

  public navigateToEdit(result: Result) {
    this.router.navigate([`result/${result.id}`]);
  }

  public navigateToCreate() {
    this.router.navigate([`result/new`]);
  }

  public deleteSelectedResults() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the selected results? (' +
        this.selectedResults?.length +
        ' selected)',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.selectedResults) {
          return;
        }

        this.results = this.results.filter(
          (val) => !this.selectedResults.includes(val),
        );

        this.selectedResults.forEach((result: { id: number }) => {
          this.resultService.resultDestroy(result.id).subscribe({
            next: (response) => {
              console.log(response);
              this.updatePage();
            },

            error: (error) => {
              this.showError(`Error deleting result: ${error.message}`);
            },
          });
        });
        this.selectedResults = [];
        this.showSuccess('Results Deleted');
      },
    });
  }

  public clearSelectedUsers() {
    this.selectedResults = [];
  }

  public deleteResult(result: Result) {
    this.confirmationService.confirm({
      message:
        `Are you sure you want to delete result with id ${result.id}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.resultService.resultDestroy(result.id).subscribe({
          next: (_response) => {
            if (this.selectedResults) {
              this.selectedResults = this.selectedResults.filter(
                (val) => val.id !== result.id,
              );
            }
            this.updatePage();
          },
          error: (error: any) => {
            this.showError('Failed to delete result');
          },
        });
        this.result = {} as Result;
        this.showSuccess('Result deleted');
      },
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

  public getSubjectName(subjectId: number): string {
    return this.subjects.find((subject) => subject.id === subjectId)?.name || '';
  }
}
