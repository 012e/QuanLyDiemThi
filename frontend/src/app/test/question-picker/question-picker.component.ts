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
  Difficulty,
  DifficultyService,
  Question,
  QuestionService,
  Subject,
  SubjectService,
} from '../../core/api';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-question-picker',
  standalone: true,
  imports: [ButtonModule, TableModule, InputTextModule],
  templateUrl: './question-picker.component.html',
  styleUrl: './question-picker.component.css',
  providers: [ConfirmationService, MessageService],
})
export class QuestionPickerComponent implements OnInit {
  public instance: DynamicDialogComponent | undefined;
  public exceptQuestions!: Array<number>;
  public subjectOnly!: number;

  constructor(
    public dialogRef: DynamicDialogRef,
    private readonly dialogService: DialogService,
    private readonly subjectService: SubjectService,
    private readonly difficultyService: DifficultyService,
    private readonly questionService: QuestionService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) {
    this.instance = this.dialogService.getInstance(this.dialogRef);
  }

  private readonly DEFAULT_PAGE_SIZE = 10;

  questions!: Question[];
  question!: Question;

  selectedQuestions!: Question[];

  subjects!: Subject[];
  subject!: Subject;

  difficulties!: Difficulty[];
  difficulty!: Difficulty;

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
    this.exceptQuestions = data.exceptQuestions;
    this.subjectOnly = data.subjectOnly;
  }

  public resetPage() {
    this.first = 0;
  }

  private loadInitialData() {
    this.updatePage();
    this.searchText$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query: string) => {
        this.resetPage();
        this.searchText = query;
        this.updatePage();
      });
    this.subjectService.subjectList().subscribe((subjects) => {
      this.subjects = subjects;
    });

    this.difficultyService.difficultyList().subscribe((difficulties) => {
      this.difficulties = difficulties;
    });
  }

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    this.questionService
      .questionList(this.rows, this.first, undefined, this.searchText, this.subjectOnly)
      .subscribe((data) => {
        this.questions = data.results;
        this.count = data.count;
      });
  }

  public clearSelectedQuestions() {
    this.selectedQuestions = [];
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

  public getDifficultyLabelById(index: number) {
    return this.difficulties.find((difficulty) => difficulty.id === index)
      ?.name;
  }

  public getSubjectLabelById(index: number) {
    return this.subjects.find((subject) => subject.id === index)?.name;
  }

  public getValue(event: Event) {
    return (event.target as HTMLInputElement).value;
  }

  public handleSearch(query: string) {
    this.searchText$.next(query);
  }

  public canSubmit(): boolean {
    if (!this.selectedQuestions || !this.selectedQuestions.length) {
      return false;
    }
    return true;
  }

  public submit(): void {
    const selectedQuestions = this.selectedQuestions.map(
      (question) => question.id,
    );
    this.dialogRef.close(selectedQuestions);
  }
}
