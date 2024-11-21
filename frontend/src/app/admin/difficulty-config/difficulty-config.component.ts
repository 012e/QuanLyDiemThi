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
import { Difficulty, DifficultyService } from '../../core/api';

@Component({
  selector: 'app-difficulty-config',
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
  templateUrl: './difficulty-config.component.html',
  styleUrl: './difficulty-config.component.css',
})
export class DifficultyConfigComponent implements OnInit {
  difficultyForm!: FormGroup;
  difficultyDialog: boolean = false;

  selectedDifficulties!: Difficulty[];
  difficulties!: Difficulty[];
  difficulty!: Difficulty;

  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly difficultyService: DifficultyService
  ) {}

  public ngOnInit() {
    this.initForm();
    this.loadInitialData();
  }

  private initForm() {
    this.difficultyForm = this.fb.group({
      id: [undefined],
      name: [undefined, Validators.required],
    });
  }

  private loadInitialData() {
    this.difficultyService.difficultyList().subscribe((data) => {
      this.difficulties = data;
    });
  }

  public openNew() {
    this.difficultyForm.reset();
    this.difficultyDialog = true;
  }

  public updatePage() {
    this.loadInitialData();
  }

  public editDifficulty(difficulty: Difficulty) {
    this.difficultyForm.patchValue(difficulty);
    this.difficultyDialog = true;
  }

  public deleteselectedDifficulties() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the selected Difficultys? (' +
        this.selectedDifficulties?.length +
        ' selected)',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.selectedDifficulties) {
          return;
        }

        this.difficulties = this.difficulties.filter(
          (val) => !this.selectedDifficulties.includes(val)
        );

        this.selectedDifficulties.forEach((difficulty: { id: number }) => {
          this.difficultyService.difficultyDestroy(difficulty.id).subscribe({
            next: (response) => {
              console.log(response);
              this.updatePage();
            },

            error: (error) => {
              this.showError(`Error deleting difficulties: ${error.message}`);
            },
          });
        });
        this.selectedDifficulties = [];
        this.showSuccess('Difficulties Deleted');
      },
    });
  }

  public clearselectedDifficulties() {
    this.selectedDifficulties = [];
  }

  public deleteDifficulty(difficulty: Difficulty) {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete Difficulty ' + difficulty.id + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.difficultyService.difficultyDestroy(difficulty.id).subscribe({
          next: (response) => {
            if (this.selectedDifficulties) {
              this.selectedDifficulties = this.selectedDifficulties.filter(
                (val) => val.id !== difficulty.id
              );
            }
            console.log(response);
            this.updatePage();
          },
          error: (error) => {
            console.error(error);
          },
        });
        this.difficulty = {} as Difficulty;
        this.showSuccess('Difficulty Deleted');
      },
    });
  }

  public hideDialog() {
    this.difficultyDialog = false;
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

  private updateDifficulty(Difficulty: Difficulty) {
    this.difficultyService
      .difficultyUpdate(Difficulty.id, Difficulty)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.updatePage();
        },

        error: (error) => {
          console.error(error);
        },
      });
    this.showSuccess('Difficulty Updated');
  }

  private createDifficulty(Difficulty: Difficulty) {
    this.difficultyService.difficultyCreate(Difficulty).subscribe({
      next: (response) => {
        console.log(`Updated Difficulty: ${response}`);
        this.updatePage();
        this.showSuccess('Difficulty Created');
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  public saveDifficulty() {
    this.difficultyForm.markAllAsTouched();

    if (this.difficultyForm.invalid) {
      this.showError('Name is required');
      return;
    }

    const Difficulty: Difficulty = this.difficultyForm.value;

    if (Difficulty.id) {
      this.updateDifficulty(Difficulty);
    } else {
      this.createDifficulty(Difficulty);
    }

    this.difficultyDialog = false;
  }
}
