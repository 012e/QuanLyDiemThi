import { CommonModule } from '@angular/common';
import { Input, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { ConfirmationService, MessageService } from 'primeng/api';
import {
  Subject as RxSubject,
  debounceTime,
  distinctUntilChanged,
  finalize,
} from 'rxjs';
import {
  ResultService,
  StandaloneStudentResult,
  StudentresultService,
  Subject,
  SubjectService,
} from '../../core/api';
import { Result } from '../../core/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ResultStudentEditComponent } from '../result-student-edit/result-student-edit.component';
import { ResultStudentCreateComponent } from '../result-student-create/result-student-create.component';

@Component({
  selector: 'app-result-student-list',
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
  ],
  templateUrl: './result-student-list.component.html',
  styleUrl: './result-student-list.component.css',
})
export class ResultStudentListComponent implements OnInit, OnDestroy {
  private readonly DEFAULT_PAGE_SIZE = 10;

  @Input({ required: true })
  resultId!: number;

  editDialog: DynamicDialogRef | undefined;
  createDialog: DynamicDialogRef | undefined;

  results!: StandaloneStudentResult[];
  result!: StandaloneStudentResult;

  subjects!: Subject[];

  selectedResults!: StandaloneStudentResult[];

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
    private readonly studentResultService: StudentresultService,
    private readonly dialogService: DialogService,
  ) {}

  public ngOnDestroy(): void {
    if (this.editDialog) {
      this.editDialog.close();
    }
  }

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
      .resultDetailList(
        this.resultId,
        this.rows,
        this.first,
        undefined,
        this.searchText,
      )
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.results = data.results;
          this.count = data.count;
        },
        error: (error) => {
          this.loading = false;
          this.showError('Failed to load results');
        },
      });
  }

  public openEditDialog(result: Result) {
    this.editDialog = this.dialogService.open(ResultStudentEditComponent, {
      header: 'Edit Student Result',
      modal: true,
      width: '40%',
      contentStyle: { overflow: 'auto' },
      data: {
        result: result,
      },
      baseZIndex: 10000,
    });

    this.editDialog.onClose.subscribe((result: Result) => {
      if (result) {
        this.showSuccess('Student result updated successfully');
        this.updatePage();
      }
    });
  }

  public openCreateDialog() {
    this.editDialog = this.dialogService.open(ResultStudentCreateComponent, {
      header: 'Create Student Result',
      modal: true,
      width: '40%',
      data: {
        resultId: this.resultId,
        description: 'Create a new student result',
      },
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });

    this.editDialog.onClose.subscribe((result: StandaloneStudentResult) => {
      if (result) {
        this.showSuccess('Student result created successfully');
        this.updatePage();
      }
    });

  }

  public deleteSelectedResults() {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the selected student results? (${this.selectedResults?.length} selected)`,
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
          this.studentResultService
            .studentresultDestroy(result.id)
            .pipe(finalize(() => this.updatePage()))
            .subscribe({
              next: (response) => {
                console.log('Result deleted', response);
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

  public deleteResult(result: StandaloneStudentResult) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this student result?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.studentResultService.studentresultDestroy(result.id).subscribe({
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
        this.result = {} as StandaloneStudentResult;
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
    return (
      this.subjects.find((subject) => subject.id === subjectId)?.name || ''
    );
  }
}
