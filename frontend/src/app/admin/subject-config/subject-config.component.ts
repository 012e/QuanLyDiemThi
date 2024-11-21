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
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { SubjectService, Subject } from '../../core/api';
@Component({
  selector: 'app-subject-config',
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
    InputTextModule,
    FormsModule,
    InputNumberModule,
    ReactiveFormsModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './subject-config.component.html',
  styleUrl: './subject-config.component.css'
})
export class SubjectConfigComponent implements OnInit {
  SubjectForm!: FormGroup;
  SubjectDialog: boolean = false;
  selectedSubjects!: Subject[];
  Subjects!: Subject[];
  Subject!: Subject;

  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly subjectSerivice: SubjectService
  ) {}

  public ngOnInit() {
    this.initForm();
    this.loadInitialData();
  }

  private initForm() {
    this.SubjectForm = this.fb.group({
      id: [undefined],
      name: [undefined, Validators.required],
    });
  }

  private loadInitialData() {
    this.subjectSerivice.subjectList().subscribe((data) => {
      this.Subjects = data;
    });
  }

  public openNew() {
    this.SubjectForm.reset();
    this.SubjectDialog = true;
  }

  public updatePage() {
    this.loadInitialData();
  }

  public editSubject(Subject: Subject) {
    this.SubjectForm.patchValue(Subject);
    this.SubjectDialog = true;
  }

  public deleteselectedSubjects() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the selected subjects? (' +
        this.selectedSubjects?.length +
        ' selected)',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.selectedSubjects) {
          return;
        }

        this.Subjects = this.Subjects.filter(
          (val) => !this.selectedSubjects.includes(val)
        );

        this.selectedSubjects.forEach((Subject: { id: number }) => {
          this.subjectSerivice.subjectDestroy(Subject.id).subscribe({
            next: (response) => {
              console.log(response);
              this.updatePage();
            },

            error: (error) => {
              this.showError(`Error deleting subjects: ${error.message}`);
            },
          });
        });
        this.selectedSubjects = [];
        this.showSuccess('Subjects Deleted');
      },
    });
  }

  public clearselectedSubjects() {
    this.selectedSubjects = [];
  }

  public deleteSubject(Subject: Subject) {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete subject ' + Subject.id + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.subjectSerivice.subjectDestroy(Subject.id).subscribe({
          next: (response) => {
            if (this.selectedSubjects) {
              this.selectedSubjects = this.selectedSubjects.filter(
                (val) => val.id !== Subject.id
              );
            }
            console.log(response);
            this.updatePage();
          },
          error: (error) => {
            console.error(error);
          },
        });
        this.Subject = {} as Subject;
        this.showSuccess('Subject Deleted');
      },
    });
  }

  public hideDialog() {
    this.SubjectDialog = false;
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

  private updateSubject(Subject: Subject) {
    this.subjectSerivice
      .subjectUpdate(Subject.id, Subject)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.updatePage();
        },

        error: (error) => {
          console.error(error);
        },
      });
    this.showSuccess('Subject Updated');
  }

  private createSubject(Subject: Subject) {
    this.subjectSerivice.subjectCreate(Subject).subscribe({
      next: (response) => {
        console.log(`Updated Subject: ${response}`);
        this.updatePage();
        this.showSuccess('Subject Created');
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  public saveSubject() {
    this.SubjectForm.markAllAsTouched();

    if (this.SubjectForm.invalid) {
      this.showError('Name is required');
      return;
    }

    const Subject: Subject = this.SubjectForm.value;

    if (Subject.id) {
      this.updateSubject(Subject);
    } else {
      this.createSubject(Subject);
    }

    this.SubjectDialog = false;
  }
}
