import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { DropdownModule } from "primeng/dropdown";
import { FileUploadModule } from "primeng/fileupload";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { RadioButtonModule } from "primeng/radiobutton";
import { RatingModule } from "primeng/rating";
import { RippleModule } from "primeng/ripple";
import { TableModule, TablePageEvent } from "primeng/table";
import { TagModule } from "primeng/tag";
import { ToastModule } from "primeng/toast";
import { ToolbarModule } from "primeng/toolbar";
import {
	Difficulty,
	DifficultyService,
	Question,
	QuestionService,
	Subject,
	SubjectService,
} from "../core/api";
import { debounceTime, distinctUntilChanged, Subject as RxSubject } from "rxjs";

@Component({
	selector: "app-question",
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
	],
	providers: [
		MessageService,
		ConfirmationService,
		QuestionService,
		SubjectService,
		DifficultyService,
	],
	templateUrl: "./question.component.html",
	styleUrl: "./question.component.css",
})
export class QuestionComponent implements OnInit {
	private readonly DEFAULT_PAGE_SIZE = 10;
	questionDialog: boolean = false;
	questions!: Question[];
	question!: Question;
	selectedQuestions!: Question[] | null;

	subjects!: Subject[];
	subject!: Subject;

	difficulties!: Difficulty[];
	difficulty!: Difficulty;

	submitted: boolean = false;
	searchValue: string | undefined;

	public count!: number;
	public first: number = 0;
	public rows: number = this.DEFAULT_PAGE_SIZE;
	public searchText: string = "";

	private searchText$ = new RxSubject<string>();

	constructor(
		private questionService: QuestionService,
		private messageService: MessageService,
		private confirmationService: ConfirmationService,
		private subjectService: SubjectService,
		private difficultyService: DifficultyService,
	) {}

	public resetPagination() {
		this.first = 0;
		this.rows = this.DEFAULT_PAGE_SIZE;
	}

	public ngOnInit() {
		this.searchText$
			.pipe(debounceTime(500), distinctUntilChanged())
			.subscribe((query: string) => {
				if (query) {
					this.resetPagination();
					this.searchText = query;
					this.updatePage();
				}
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
		this.question = {} as Question;
		this.submitted = false;
		this.questionDialog = true;
	}

	public deleteSelectedQuestions() {
		this.confirmationService.confirm({
			message:
				"Are you sure you want to delete the selected questions? (" +
				this.selectedQuestions?.length +
				" selected)",
			header: "Confirm",
			icon: "pi pi-exclamation-triangle",
			acceptButtonStyleClass: "p-button-danger",
			accept: () => {
				this.questions = this.questions.filter(
					(val) => !this.selectedQuestions?.includes(val),
				);
				if (this.selectedQuestions) {
					this.selectedQuestions.forEach((question: { id: number }) => {
						this.questionService.questionDestroy(question.id).subscribe({
							next: (response) => {
								console.log(response);
								this.updatePage();
							},

							error: (error) => {
								this.messageService.add({
									severity: "error",
									summary: "Error",
									detail: `Error deleting question: ${error.message}`,
									life: 3000,
								});
							},
						});
					});
				}
				this.selectedQuestions = null;
				this.messageService.add({
					severity: "success",
					summary: "Successful",
					detail: "Questions Deleted",
					life: 3000,
				});
			},
		});
	}

	public clearSelectedQuestions() {
		this.selectedQuestions = null;
	}

	public editQuestion(question: Question) {
		this.question = { ...question };
		this.questionDialog = true;
	}

	public deleteQuestion(question: Question) {
		this.confirmationService.confirm({
			message: "Are you sure you want to delete question " + question.id + "?",
			header: "Confirm",
			icon: "pi pi-exclamation-triangle",
			acceptButtonStyleClass: "p-button-danger",
			accept: () => {
				this.questionService.questionDestroy(question.id).subscribe({
					next: (response) => {
						console.log(response);
						this.updatePage();
					},
					error: (error) => {
						console.error(error);
					},
				});
				this.questions = this.questions.filter((val) => val.id !== question.id);
				this.question = {} as Question;
				this.messageService.add({
					severity: "success",
					summary: "Successful",
					detail: "Question Deleted",
					life: 3000,
				});
			},
		});
	}

	public hideDialog() {
		this.questionDialog = false;
		this.submitted = false;
	}

	public saveQuestion() {
		this.submitted = true;

		if (
			this.question.detail?.trim() &&
			this.question.subject &&
			this.question.difficulty
		) {
			if (this.question.id) {
				this.questionService
					.questionUpdate(this.question.id, this.question)
					.subscribe({
						next: (response) => {
							console.log(response);
							this.updatePage();
						},

						error: (error) => {
							console.error(error);
						},
					});
				this.messageService.add({
					severity: "success",
					summary: "Successful",
					detail: "Question Updated",
					life: 3000,
				});
			} else {
				this.questions.push(this.question);
				this.questionService.questionCreate(this.question).subscribe({
					next: (response) => {
						console.log(response);
					},

					error: (error) => {
						console.error(error);
					},
				});
				this.messageService.add({
					severity: "success",
					summary: "Successful",
					detail: "Question Created",
					life: 3000,
				});
			}

			this.questions = [...this.questions];
			this.questionDialog = false;
			this.question = {} as Question;
			this.onPage({ first: this.first, rows: this.rows });
			this.updatePage();
		} else {
			if (!this.question.subject) {
				this.messageService.add({
					severity: "error",
					summary: "Error",
					detail: "Subject is required",
					life: 3000,
				});
			} else if (!this.question.detail) {
				this.messageService.add({
					severity: "error",
					summary: "Error",
					detail: "Detail is required",
					life: 3000,
				});
			} else if (!this.question.difficulty) {
				this.messageService.add({
					severity: "error",
					summary: "Error",
					detail: "Difficulty is required",
					life: 3000,
				});
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
