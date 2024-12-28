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
import { SubjectService, Subject, Role, RoleService } from '../../core/api';
import { Utils } from '../../core/utils/utils';
import { Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoleEditComponent } from '../role-edit/role-edit.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-role-config',
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
  templateUrl: './role-config.component.html',
  styleUrl: './role-config.component.css',
  providers: [ConfirmationService, DialogService],
})
export class RoleConfigComponent {
  roleForm!: FormGroup;
  subjectDialog: boolean = false;
  selectedSubjects!: Subject[];
  Subjects!: Subject[];
  Subject!: Subject;
  roles: Role[] = [];
  editDialog: DynamicDialogRef | undefined;

  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly roleService: RoleService,
    private readonly subjectSerivice: SubjectService,
    private readonly dialogService: DialogService,
    private readonly authService: AuthService,

    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.initForm();
    this.loadInitialData();
  }

  private initForm() {
    this.roleForm = this.fb.group({
      name: [undefined, Validators.required],
      permissions: [[]],
    });
  }

  private loadInitialData() {
    this.subjectSerivice.subjectList().subscribe((data) => {
      this.Subjects = data;
    });
    this.roleService.roleList().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: "Couldn't load roles",
          life: 3000,
        });
      },
    });
  }

  public openNew() {
    this.roleForm.reset();
    this.subjectDialog = true;
  }

  public updatePage() {
    this.loadInitialData();
  }

  public editRole(role: Role) {
    if (!role) {
      throw new Error('Role is undefined');
    }

    this.editDialog = this.dialogService.open(RoleEditComponent, {
      header: 'Edit Role',
      data: {
        role: role,
      },
    });

    this.editDialog.onClose.subscribe((role: Role) => {
      if (role) {
        console.log(role);
        this.updatePage();
        this.authService.updateRoles();
      }
    });
  }

  public deleteRole(role: Role) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete role ' + role.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.roleService.roleDestroy(role.id).subscribe({
          next: (response) => {
            console.log(response);
            this.updatePage();
            this.showSuccess('Role Deleted');
          },
          error: (error) => {
            console.error(error);
          },
        });
        this.Subject = {} as Subject;
      },
    });
  }

  public hideDialog() {
    this.subjectDialog = false;
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

  private createRole(role: Role) {
    this.roleService.roleCreate(role).subscribe({
      next: (response) => {
        console.log(`Created new role: ${response.name}`);
        this.updatePage();
        this.showSuccess('Role Created');
        this.subjectDialog = false;
      },

      error: (error) => {
        console.error(error);
        this.showError(`Eror creating role: ${Utils.prettyError(error.error)}`);
      },
    });
  }

  public saveRole() {
    this.roleForm.markAllAsTouched();

    if (this.roleForm.invalid) {
      this.showError('Please fill in all required fields');
      return;
    }

    const roleValue = {
      ...this.roleForm.value,
      permissions: [],
    };

    this.createRole(roleValue);
  }
}
