import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfigService } from '../core/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TabViewModule } from 'primeng/tabview';
import { DifficultyConfigComponent } from './difficulty-config/difficulty-config.component';
import { SubjectConfigComponent } from './subject-config/subject-config.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    InputTextareaModule,
    ConfirmDialogModule,
    DialogModule,
    RippleModule,
    TableModule,
    ToastModule,
    CommonModule,
    TabViewModule,
    DifficultyConfigComponent,
    SubjectConfigComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  configForm!: FormGroup;
  configDialog: boolean = false;
  configs: { key: string; value: string }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly configService: ConfigService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {}

  private createConfigForm(): void {
    this.configForm = this.fb.group({
      key: [undefined, Validators.required],
      value: [undefined, Validators.required],
    });
  }

  public ngOnInit(): void {
    this.createConfigForm();
    this.loadConfig();
  }

  public hideConfigDialog(): void {
    this.configDialog = false;
  }

  public saveConfig(): void {
    this.configForm.markAllAsTouched();

    if (this.configForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill out all fields',
        life: 3000,
      });
      return;
    } else {
      this.configService.configUpdate([this.configForm.value]).subscribe({
        next: (response) => {
          console.log(response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message,
            life: 3000,
          });
        },

        error: (error) => {
          console.error(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error.message,
            life: 3000,
          });
        },
      });
    }
    this.loadConfig();
    this.configDialog = false;
  }

  public loadConfig(): void {
    this.configService.configRetrieve().subscribe((config) => {
      this.configs = Object.entries(config).map(([key, value]) => ({
        key,
        value,
      }));
    });
  }

  public editConfig(config: { key: string; value: string }): void {
    this.configDialog = true;
    this.configForm.patchValue(config);
  }
}
