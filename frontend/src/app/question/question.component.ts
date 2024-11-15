import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { Difficulty, DifficultyService, Question, QuestionService, Subject, SubjectService } from '../core/api';

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
  ],
  providers: [
    MessageService, 
    ConfirmationService, 
    QuestionService,
    SubjectService,
    DifficultyService,
  ],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css'
})
export class QuestionComponent implements OnInit {
  questionDialog: boolean = false;
  questions!: Question[];
  question!: Question;
  selectedQuestions!: Question[] | null;

  subjects!: Subject[];
  subject!: Subject;

  difficulties!: Difficulty[];
  difficulty!: Difficulty;

  submitted: boolean = false;

  constructor(
    private questionService: QuestionService, 
    private messageService: MessageService, 
    private confirmationService: ConfirmationService,
    private subjectService: SubjectService,
    private difficultyService: DifficultyService,
  ) {}

  ngOnInit() {
    this.questionService.questionList().subscribe(questions => {
      this.questions = questions.results;
    });

    this.subjectService.subjectList().subscribe(subjects => {
      this.subjects = subjects.results.map(subject => {
        return {
          ...subject,
          label: subject.name,
          value: subject.id
        }
      })
    });

    this.difficultyService.difficultyList().subscribe(difficulties => {
      this.difficulties = difficulties;
    });
  }

  openNew() {
    this.question = {} as Question;
    this.submitted = false;
    this.questionDialog = true;
  }

  deleteSelectedQuestions() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected questions?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.questions = this.questions.filter(val => !this.selectedQuestions?.includes(val));
        if (this.selectedQuestions) {
          this.selectedQuestions.forEach((question: { id: number; }) => {
            this.questionService.questionDestroy(question.id).subscribe({
              next: (response) => {
                console.log(response);
                this.refresh();
              },
              
              error: (error) => {
                console.error(error);
              }
            });
          });
        }
        this.selectedQuestions = null;
        this.messageService.add({severity:'success', summary: 'Successful', detail: 'Questions Deleted', life: 3000});
      }
    });
  }

  editQuestion(question: Question) {
    this.question = {...question};
    this.questionDialog = true;
  }

  deleteQuestion(question: Question) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + question.id + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.questionService.questionDestroy(question.id).subscribe({
          next: (response) => {
            console.log(response);
            this.refresh();
          },
          error: (error) => {
            console.error(error);
          }
        });
        this.questions = this.questions.filter(val => val.id !== question.id);
        this.question = {} as Question;
        this.messageService.add({severity:'success', summary: 'Successful', detail: 'Question Deleted', life: 3000});
      }
    });
  }

  hideDialog() {
    this.questionDialog = false;
    this.submitted = false;
  }

  saveQuestion() {
    this.submitted = true;

    if (this.question.detail?.trim()) {
      if (this.question.id) {
        this.questionService.questionUpdate(this.question.id, this.question).subscribe({
          next: (response) => {
            console.log(response);
            this.refresh();
          },

          error: (error) => {
            console.error(error);
          }
        });
        this.messageService.add({severity:'success', summary: 'Successful', detail: 'Question Updated', life: 3000});
      }

      else {
        this.questions.push(this.question);
        this.questionService.questionCreate(this.question).subscribe({
          next: (response) => {
            console.log(response);
          },

          error: (error) => {
            console.error(error);
          }
        }
        );
        this.messageService.add({severity:'success', summary: 'Successful', detail: 'Question Created', life: 3000});
      }

      this.questions = [...this.questions];
      this.questionDialog = false;
      this.question = {} as Question;
    }
  }

  refresh() {
    this.questionService.questionList().subscribe(questions => {
      this.questions = questions.results;
    });
  }

  getDifficultyLabelById(index: number) {
    return this.difficulties.find(difficulty => difficulty.id === index)?.name;
  }

  getSubjectLabelById(index: number) {
    return this.subjects.find(subject => subject.id === index)?.name;
  }
}
