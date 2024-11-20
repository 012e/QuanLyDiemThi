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
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';

import {
  Difficulty,
  DifficultyService,
  Question,
  QuestionService,
  Subject,
  SubjectService,
} from '../core/api';
import { debounceTime, distinctUntilChanged, Subject as RxSubject } from 'rxjs';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [
    TableModule,
    DialogModule,
    RippleModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule,
    InputTextModule,
    InputTextareaModule,
    CommonModule,
    FileUploadModule,
    DropdownModule,
    TagModule,
    RadioButtonModule,
    RatingModule,
    InputTextModule,
    FormsModule,
    InputNumberModule,
    DividerModule,
    ReactiveFormsModule,
  ],
  providers: [
    MessageService,
    ConfirmationService,
    QuestionService,
    SubjectService,
    DifficultyService,
  ],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css',
})
export class QuestionComponent implements OnInit {
  private readonly DEFAULT_PAGE_SIZE = 10;
  questionForm!: FormGroup;
  questionDialog: boolean = false;
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

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private subjectService: SubjectService,
    private difficultyService: DifficultyService
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
      this.subjects = subjects.results.map((subject) => {
        return {
          ...subject,
          label: subject.name,
          value: subject.id,
        };
      });
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
        this.questions = this.questions.filter(
          (val) => !this.selectedQuestions?.includes(val)
        );
        if (this.selectedQuestions) {
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
        }
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
            console.log(response);
            this.selectedQuestions = this.selectedQuestions.filter(
              (val) => val.id !== question.id
            );
            this.updatePage();
          },
          error: (error) => {
            console.error(error);
          },
        });
        this.questions = this.questions.filter((val) => val.id !== question.id);
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

  public saveQuestion() {
    this.submitted = true;
    this.questionForm.markAllAsTouched();

    if (this.questionForm.valid) {
      const questionData = this.questionForm.value;
      if (questionData.id) {
        this.questionService
          .questionUpdate(questionData.id, questionData)
          .subscribe({
            next: (response) => {
              console.log(response);
              this.updatePage();
            },

            error: (error) => {
              console.error(error);
            },
          });
        this.showSuccess('Question Updated');
      } else {
        this.questions.push(questionData);
        this.questionService.questionCreate(questionData).subscribe({
          next: (response) => {
            console.log(response);
          },

          error: (error) => {
            console.error(error);
          },
        });
        this.showSuccess('Question Created');
      }

      this.questionDialog = false;
      this.onPage({ first: this.first, rows: this.rows });
      this.updatePage();
    } else {
      if (this.questionForm.get('subject')?.invalid) {
        this.showError('Subject is required');
      } else if (this.questionForm.get('detail')?.invalid) {
        this.showError('Detail is required');
      } else if (this.questionForm.get('difficulty')?.invalid) {
        this.showError('Difficulty is required');
      }
    }
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
