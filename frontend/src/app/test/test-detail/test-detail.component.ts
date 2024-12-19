import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import {
  Difficulty,
  DifficultyService,
  Question,
  QuestionService,
  Subject,
  SubjectService,
  Test,
  TestService,
} from '../../core/api';
import { isNumberValidator } from '../../core/validators/is-number.validator';
import { QuestionPickerComponent } from '../question-picker/question-picker.component';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    DividerModule,
    ButtonModule,
    CalendarModule,
    TableModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './test-detail.component.html',
  styleUrl: './test-detail.component.css',
})
export class TestDetailComponent implements OnInit, OnDestroy {
  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly testService: TestService,
    private readonly questionService: QuestionService,
    private readonly difficultyService: DifficultyService,
    private readonly subjectService: SubjectService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  public testId!: number;

  public editing = false;

  public testForm!: FormGroup;
  public questionPickerRef: DynamicDialogRef | null = null;

  public subjects: Subject[] = [];
  public selectedSubjects: Subject | null = null;

  public questions: Question[] = [];
  public selectedQuestions: Question[] = [];

  public difficulties: Difficulty[] = [];

  public enableEditing(): void {
    this.editing = true;
    this.testForm.enable();
  }

  public disableEditing(): void {
    this.editing = false;
    this.testForm.disable();
  }

  public ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  public ngOnDestroy(): void {
    if (this.questionPickerRef) {
      this.questionPickerRef.close();
    }
  }

  private getTestId(): number {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = Number(idStr);
    if (!idStr || isNaN(Number(idStr))) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid test id',
      });
      this.router.navigate(['/']);
    }
    return id;
  }

  public loadData(): void {
    this.difficultyService.difficultyList().subscribe((difficulties) => {
      this.difficulties = difficulties;
    });
    this.subjectService.subjectList().subscribe((subjects) => {
      this.subjects = subjects;
    });

    this.testId = this.getTestId();
    this.testService.testRetrieve(this.testId).subscribe((data) => {
      // the API returns the datetime as a ISO 8601 string
      const datetime = new Date(data.datetime);
      this.testForm.patchValue({
        ...data,
        datetime: datetime,
        duration: Number(data.duration) / 60,
      });
      this.updateQuestions();
    });
  }

  public initForm(): void {
    this.testForm = this.fb.group({
      id: [undefined],
      subject: [null, Validators.required],
      semester: [
        null,
        [Validators.required, isNumberValidator(), Validators.min(1)],
      ],
      datetime: [null, Validators.required],
      duration: [
        null,
        [Validators.required, isNumberValidator(), Validators.min(1)],
      ],
      questions: [[]],
    });
    this.testForm.disable();
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  public syncQuestionsTableToForm(): void {
    const selectedQuestionIds = this.questions.map((question) => {
      return question.id;
    });
    this.testForm.get('questions')?.setValue(selectedQuestionIds);
  }

  public updateQuestions(): void {
    const questionIds: Array<number> =
      this.testForm.get('questions')?.value ?? [];

    const size = questionIds.length;
    this.questions = new Array<Question>(size);
    this.clearSelectedQuestions();

    questionIds.forEach((id, index) => {
      this.questionService.questionRetrieve(id).subscribe({
        next: (question) => {
          this.questions[index] = question;
        },
        error: (error) => {
          this.showError(`Failed to fetch questions: ${error.message}`);
          throw new Error(`Invalid state ${error}`);
        },
      });
    });
  }

  // figure out if duplicate ids are allowed
  private mergeQuestionIds(
    currentQuestions: Array<number>,
    newQuestions: Array<number>,
  ): Array<number> {
    return [...currentQuestions, ...newQuestions];
  }

  public addQuestion(): void {
    this.questionPickerRef = this.dialogService.open(QuestionPickerComponent, {
      header: 'Select Questions',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        exceptQuestions: this.testForm.get('questions')?.value || [],
      },
      baseZIndex: 10000,
    });

    this.questionPickerRef.onClose.subscribe((newQuestions: Array<number>) => {
      if (!newQuestions) {
        return;
      }
      console.log(`Dialog returned ${newQuestions}`);

      const currentQuestions = this.testForm.get('questions')?.value || [];

      this.testForm
        .get('questions')
        ?.setValue(this.mergeQuestionIds(currentQuestions, newQuestions));

      this.showSuccess('Questions added successfully');
      console.log(`New question ids ${this.testForm.get('questions')?.value}`);
      this.updateQuestions();
    });
  }

  public getFormValue(): Test {
    const data = this.testForm.value;
    const test: Test = {
      id: data.id,
      subject: data.subject,
      semester: data.semester,
      datetime: data.datetime,
      // duration is in minutes but the API expects seconds
      duration: (data.duration * 60).toString(),
      questions: data.questions,
      created_at: '',
      updated_at: '',
    };
    return test;
  }

  public submit(): void {
    this.testForm.markAllAsTouched();
    if (this.testForm.invalid) {
      this.showError('Form is not valid, please check the fields.');
      return;
    }
    console.log(this.getFormValue());
    this.testService.testUpdate(this.testId, this.getFormValue()).subscribe({
      next: (response) => {
        this.showSuccess('Test updated successfully');
        this.disableEditing();
      },
      error: (error) => {
        this.showError(`Failed to create test: ${error.message}`);
      },
    });
  }

  public clearSelectedQuestions() {
    this.selectedQuestions = [];
  }

  public getDifficultyLabelById(index: number) {
    return this.difficulties.find((difficulty) => difficulty.id === index)
      ?.name;
  }

  public getSubjectLabelById(index: number) {
    return this.subjects.find((subject) => subject.id === index)?.name;
  }

  public deleteQuestion(index: number): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete question number ${index + 1}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.questions.splice(index, 1);
        this.syncQuestionsTableToForm();
        this.showSuccess('Removed question from list');
      },
    });
  }
  public deleteTest(): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this test?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.testService.testDestroy(this.testId).subscribe({
          next: (value) => {
            this.showSuccess(`Successfully deleted test`);
            this.router.navigate(['/test']);
          },
          error: (error) => {
            this.showError(`Failed to delete test: ${error.message}`);
          },
        });
      },
    });
  }
}
