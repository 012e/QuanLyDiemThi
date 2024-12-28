import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Role, RoleService, User, UserService } from '../../core/api';
import { noWhitespaceValidator } from '../../core/validators/no-whitespace.validator';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';

@Component({
  selector: 'app-create-user-form',
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
    DropdownModule,
    PasswordModule,
    PickListModule,
  ],
  templateUrl: './create-user-form.component.html',
  styleUrl: './create-user-form.component.css',
})
export class CreateUserFormComponent implements OnInit {
  user!: User;
  form!: FormGroup;
  self: DynamicDialogComponent | undefined;
  roles: Role[] = [];
  selectedRoles: Role[] = [];

  readonly userTypes = [
    {
      name: 'Teacher',
      type: 'user',
    },
    {
      name: 'Staff',
      type: 'staff',
    },
    {
      name: 'Admin',
      type: 'admin',
    },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly roleService: RoleService,
    dialogService: DialogService,
    public selfRef: DynamicDialogRef,
  ) {
    this.self = dialogService.getInstance(selfRef);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: [
        undefined,
        [Validators.required, Validators.minLength(1), noWhitespaceValidator()],
      ],
      email: [undefined, [Validators.required, Validators.email]],
      first_name: [undefined, [Validators.required]],
      last_name: [undefined, [Validators.required]],
      user_type: ["admin", Validators.required],
      password: [undefined, [Validators.required, Validators.minLength(8)]],
      roles: [[]],
    });

    this.roleService.roleList().subscribe({
      next: (response) => {
        this.roles = response;
      },
      error: (error) => {
        if (this.form.invalid) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: "Coudn't load roles",
          });
          return;
        }
      },
    });
  }

  private closeWithSuccess(user: User) {
    this.selfRef.close(user);
  }

  private toSentenceCase(input: string): string {
    if (!input) return ''; // Handle empty string or null
    input = input.trim(); // Remove leading and trailing whitespace
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  }

  public submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Form is invalid, please check the form.',
      });
      return;
    }
    const formValue: User = {
      ...this.form.value,
      roles: this.selectedRoles.map((role) => role.name),
  };
    this.userService.userCreate(formValue).subscribe({
      next: (response) => {
        console.log(response);
        this.closeWithSuccess(response);
      },
      error: (error) => {
        console.error(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create user',
        });
        const response = error.error;
        for (const key in response) {
          const keyErrors = response[key];
          for (const keyError of keyErrors) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `${this.toSentenceCase(key)}: ${this.toSentenceCase(keyError)}`,
            });
          }
        }
      },
    });
  }
}
