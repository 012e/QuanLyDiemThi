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
  ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly DEFAULT_PAGE_SIZE = 10;

  editUserDialogRef: DynamicDialogRef | undefined;
  createUserDialogRef: DynamicDialogRef | undefined;

  teachers!: User[];
  teacher!: User;

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

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    this.loading = true;
    this.userService.userList(this.rows, this.first, undefined).subscribe({
      next: (data) => {
        this.loading = false;
        this.teachers = data.results;
        this.count = data.count;
      },
      error: (error) => {
        this.loading = false;
        console.error(error);
      },
    });
  }

  public openEditDialog(teacher: User) {
    this.editUserDialogRef = this.dialogService.open(EditUserFormComponent, {
      header: 'Edit Teacher',
      data: {
        user: teacher,
      },
    });
    this.editUserDialogRef.onClose.subscribe((result: { success: boolean, data: User | string }) => {
      if (!result || !result.success) {
        this.showError(`Error Creating User: ${result.data}`);
        return;
      }
      this.showSuccess('User Updated Successfully');
    });
  }

  public openCreateDialog() {
    this.editUserDialogRef = this.dialogService.open(EditUserFormComponent, {
      header: 'Create New Teacher',
    });
    this.editUserDialogRef.onClose.subscribe((teacher?: User) => {
      if (teacher) {
        this.showSuccess('User Created Successfully');
      } else {
        this.showError('Error Creating User');
      }
    });
  }

  public deleteSelectedUsers() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the selected teacher? (' +
        this.selectedUsers?.length +
        ' selected)',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.selectedUsers) {
          return;
        }

        this.teachers = this.teachers.filter(
          (val) => !this.selectedUsers.includes(val),
        );

        this.selectedUsers.forEach((question: { id: number }) => {
          this.userService.userDestroy(question.id).subscribe({
            next: (response) => {
              console.log(response);
              this.updatePage();
            },

            error: (error) => {
              this.showError(`Error deleting question: ${error.message}`);
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

  public deleteUser(teacher: User) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete question ' + teacher.id + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.userDestroy(teacher.id).subscribe({
          next: (response) => {
            if (this.selectedUsers) {
              this.selectedUsers = this.selectedUsers.filter(
                (val) => val.id !== teacher.id,
              );
            }
            this.updatePage();
          },
          error: (error) => {
            console.error(error);
          },
        });
        this.teacher = {} as User;
        this.showSuccess('User Deleted');
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
