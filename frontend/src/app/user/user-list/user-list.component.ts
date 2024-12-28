import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { Subject as RxSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { User, UserService } from '../../core/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditUserFormComponent } from '../edit-user-form/edit-user-form.component';
import { CreateUserFormComponent } from '../create-user-form/create-user-form.component';
import { NgxPermissionsModule, NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
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
    NgxPermissionsModule,
  ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly DEFAULT_PAGE_SIZE = 10;

  editUserDialogRef: DynamicDialogRef | undefined;
  createUserDialogRef: DynamicDialogRef | undefined;

  users!: User[];
  user!: User;
  userRole!: string;

  selectedUsers!: User[];

  submitted = false;
  searchValue: string | undefined;

  public count!: number;
  public first = 0;
  public rows: number = this.DEFAULT_PAGE_SIZE;
  public searchText = '';
  public loading = false;

  private searchText$ = new RxSubject<string>();

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly dialogService: DialogService,
    private readonly userService: UserService,
    private readonly roleService: NgxRolesService,
    private readonly permissionService: NgxPermissionsService,
    private readonly authService: AuthService,
  ) {}

  ngOnDestroy(): void {
    if (this.editUserDialogRef) this.editUserDialogRef.close();
    if (this.createUserDialogRef) this.createUserDialogRef.close();
  }

  public resetPage() {
    this.first = 0;
  }

  public ngOnInit() {
    this.loadInitialData();
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
  }

  public getPremission(): void {
    this.userRole = this.authService.getRole()
  }

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    this.loading = true;
    this.userService.userList(this.rows, this.first, undefined, this.searchText).subscribe({
      next: (data) => {
        this.loading = false;
        this.users = data.results;
        this.count = data.count;
      },
      error: (error) => {
        this.loading = false;
        console.error(error);
      },
    });
  }

  public openEditDialog(user: User) {
    this.editUserDialogRef = this.dialogService.open(EditUserFormComponent, {
      header: 'Edit Teacher',
      data: {
        user: user,
      },
    });
    this.editUserDialogRef.onClose.subscribe((user: User) => {
      if (user) {
        this.updatePage();
        this.showSuccess('User updated successfully');
      }
    });
  }

  public openCreateDialog() {
    this.createUserDialogRef = this.dialogService.open(
      CreateUserFormComponent,
      {
        header: 'Create New Teacher',
      },
    );
    this.createUserDialogRef.onClose.subscribe((user: User) => {
      if (user) {
        this.updatePage();
        this.showSuccess('User created successfully');
      }
    });
  }

  public deleteSelectedUsers() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the selected user? (' +
        this.selectedUsers?.length +
        ' selected)',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.selectedUsers) {
          return;
        }

        this.users = this.users.filter(
          (val) => !this.selectedUsers.includes(val),
        );

        this.selectedUsers.forEach((user: { id: number }) => {
          this.userService.userDestroy(user.id).subscribe({
            next: (response) => {
              console.log(response);
              this.updatePage();
            },

            error: (error) => {
              this.showError(`Error deleting user: ${error.message}`);
            },
          });
        });
        this.selectedUsers = [];
        this.showSuccess('Users Deleted');
      },
    });
  }

  public clearSelectedUsers() {
    this.selectedUsers = [];
  }

  public deleteUser(user: User) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete user ' + user.id + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.userDestroy(user.id).subscribe({
          next: (_response) => {
            if (this.selectedUsers) {
              this.selectedUsers = this.selectedUsers.filter(
                (val) => val.id !== user.id,
              );
            }
            this.updatePage();
          },
          error: (error) => {
            console.error(error);
          },
        });
        this.user = {} as User;
        this.showSuccess('User deleted');
      },
    });
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

  public getValue(event: Event) {
    return (event.target as HTMLInputElement).value;
  }

  public handleSearch(query: string) {
    this.searchText$.next(query);
  }
}
