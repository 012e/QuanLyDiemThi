import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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

import {
  Difficulty,
  DifficultyService,
  Question,
  QuestionService,
  Subject,
  SubjectService,
} from '../core/api';
import { debounceTime, distinctUntilChanged, Subject as RxSubject } from 'rxjs';
import { NgxPermissionsModule } from 'ngx-permissions';

@Component({
  selector: 'app-question',
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
    NgxPermissionsModule
  ],
  providers: [ConfirmationService],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css',
})
export class QuestionComponent implements OnInit {
  private readonly DEFAULT_PAGE_SIZE = 10;
  questionForm!: FormGroup;
  questionDialog = false;

  questions!: Question[];
  question!: Question;

  selectedQuestions!: Question[];

  subjects!: Subject[];
  subject!: Subject;

  difficulties!: Difficulty[];
  difficulty!: Difficulty;

  submitted = false;
  searchValue: string | undefined;

  public count!: number;
  public first = 0;
  public rows: number = this.DEFAULT_PAGE_SIZE;
  public searchText = '';

  private searchText$ = new RxSubject<string>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly questionService: QuestionService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly subjectService: SubjectService,
    private readonly difficultyService: DifficultyService,
  ) {}

  public resetPage() {
    this.first = 0;
  }

  public ngOnInit() {
    this.initForm();
    this.loadInitialData();
  }

  private initForm() {
    this.questionForm = this.fb.group({
      id: [undefined],
      subject: [undefined, Validators.required],
      difficulty: [undefined, Validators.required],
      detail: [undefined, Validators.required],
    });
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
      .questionList(this.rows, this.first, undefined, this.searchText)
      .subscribe((data) => {
        this.questions = data.results;
        this.count = data.count;
      });
  }

  public openNew() {
    this.questionForm.reset();
    this.questionDialog = true;
  }

  public editQuestion(question: Question) {
    this.questionForm.patchValue(question);
    this.questionDialog = true;
  }

  public deleteSelectedQuestions() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the selected questions? (' +
        this.selectedQuestions?.length +
        ' selected)',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.selectedQuestions) {
          return;
        }

        this.questions = this.questions.filter(
          (val) => !this.selectedQuestions.includes(val),
        );

        this.selectedQuestions.forEach((question: { id: number }) => {
          this.questionService.questionDestroy(question.id).subscribe({
            next: (response) => {
              console.log(response);
              this.updatePage();
            },

            error: (error) => {
              this.showError(`Error deleting question: ${error.message}`);
            },
          });
        });
        this.selectedQuestions = [];
        this.showSuccess('Questions Deleted');
      },
    });
  }

  public clearSelectedQuestions() {
    this.selectedQuestions = [];
  }

  public deleteQuestion(question: Question) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete question ' + question.id + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.questionService.questionDestroy(question.id).subscribe({
          next: (response) => {
            if (this.selectedQuestions) {
              this.selectedQuestions = this.selectedQuestions.filter(
                (val) => val.id !== question.id,
              );
            }
            this.updatePage();
          },
          error: (error) => {
            console.error(error);
          },
        });
        this.question = {} as Question;
        this.showSuccess('Question Deleted');
      },
    });
  }

  public hideDialog() {
    this.questionDialog = false;
    this.submitted = false;
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

  private updateQuestion(question: Question) {
    this.questionService.questionUpdate(question.id, question).subscribe({
      next: (response) => {
        console.log(response);
        this.updatePage();
      },

      error: (error) => {
        console.error(error);
      },
    });
    this.showSuccess('Question Updated');
  }

  private createQuestion(question: Question) {
    this.questionService.questionCreate(question).subscribe({
      next: (response) => {
        console.log(`Updated question: ${response}`);
        this.updatePage();
        this.showSuccess('Question Created');
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  public saveQuestion() {
    this.submitted = true;
    this.questionForm.markAllAsTouched();

    if (this.questionForm.invalid) {
      if (this.questionForm.get('subject')?.invalid) {
        this.showError('Subject is required');
      }
      if (this.questionForm.get('detail')?.invalid) {
        this.showError('Detail is required');
      }
      if (this.questionForm.get('difficulty')?.invalid) {
        this.showError('Difficulty is required');
      }
      return;
    }

    const question: Question = this.questionForm.value;

    if (question.id) {
      this.updateQuestion(question);
    } else {
      this.createQuestion(question);
    }

    this.questionDialog = false;
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
}
