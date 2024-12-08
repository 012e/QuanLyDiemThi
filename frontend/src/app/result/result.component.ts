import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Result, ResultsService, SubjectService, ClassService, UserService } from '../core/api';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  of,
  Subject,
  tap,
} from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [
    TableModule,
    DividerModule,
    SkeletonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
],
  providers: [ConfirmationService],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly resultsService: ResultsService,
    private readonly subjectServive: SubjectService,
    private readonly classService: ClassService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
  ) {}

  public results!: Result[];
  public count!: number;
  public selectedResults: Result[] = [];

  public first: number = 0;
  public rows: number = 15;
  public isLoading: boolean = false;

  public searchText: string = '';
  private searchText$ = new Subject<string>();

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    this.isLoading = true;
    this.resultsService.resultsList(this.rows, this.first).subscribe((data) => {
      this.results = data.results;
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
  }

  public clearSelectedResults(): void {
    this.selectedResults = [];
  }

  public deleteSelectedResults(): void {
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

        const delete$ = this.selectedResults.map((result) =>
          this.resultsService.resultsDestroy(result.id).pipe(
            map(() => ({ id: result.id, success: true })),
            catchError(() => {
              this.showError(`Failed to delete result with id ${result.id}`);
              return of({ id: result.id, success: false });
            }),
          ),
        );

        forkJoin(delete$).subscribe({
          next: (results) => {
            console.log(results);
            this.updatePage();
            this.clearSelectedResults();
            this.showSuccess(
              `Successfully deleted ${results.length} ${results.length === 1 ? 'result' : 'results'}.`,
            );
          },
          error: (error) => {
            this.showError(`Failed to delete some results.`);
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

  public deleteResult(result: Result): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete result with id ${result.id}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.resultsService.resultsDestroy(result.id).subscribe({
          next: (value) => {
            this.updatePage();
            if (this.selectedResults.includes(result)) {
              this.selectedResults = this.selectedResults.filter(
                (selected) => selected !== result,
              );
            }
            this.showSuccess(`Successfully deleted result with id ${result.id}`);
          },
          error: (error) => {
            this.showError(
              `Failed to delete result with id ${result.id}: ${error.message}`,
            );
          },
        });
      },
    });
  }
  public editResult(result: Result): void {
    this.router.navigate(['/result', result.id]);
  }
  public createNew(): void {
    this.router.navigate(['/result/new']);
  }
  public getSubjectLabelById(id: number)  {
    this.subjectServive.subjectRetrieve(id).subscribe({
      next: (subject) => {
        return subject.name;
      },
      error: (error) => {
        return error;
      },
    });
  }
  public getClassLabelById(id: number) {
    this.classService.classRetrieve(id).subscribe({
      next: (classroom) => {
        return classroom.name;
      },
      error: (error) => {
        return error;
      },
    });
  }
  public getTeacherlabelById(id: number) {
    this.userService.userRetrieve(id).subscribe({
      next: (user) => {
        return user.username;
      },
      error: (error) => {
        return error;
      },
    });
  }
}
