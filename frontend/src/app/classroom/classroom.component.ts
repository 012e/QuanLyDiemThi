import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Class, ClassService, User, UserService } from '../core/api';
import {
  NgxPermissionsModule,
  NgxPermissionsService,
  NgxRolesService,
} from 'ngx-permissions';
import { Router } from '@angular/router';
@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    RadioButtonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    RippleModule,
    NgxPermissionsModule,
  ],
  providers: [ClassService, ConfirmationService, DialogService],
  templateUrl: './classroom.component.html',
  styleUrl: './classroom.component.css',
})
export class ClassroomComponent implements OnInit {
  private readonly DEFAULT_PAGE_SIZE = 10;

  editClassDialogRef: DynamicDialogRef | undefined;
  createClassDialogRef: DynamicDialogRef | undefined;

  classes!: Class[];
  classroom!: Class;
  teachers!: User[];

  selectedClasses!: Class[];

  submitted = false;
  searchValue: string | undefined;

  public count!: number;
  public first = 0;
  public rows: number = this.DEFAULT_PAGE_SIZE;
  public searchText = '';
  public loading = false;

  private searchText$ = new RxSubject<string>();

  constructor(
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly dialogService: DialogService,
    private readonly classService: ClassService,
    private readonly roleService: NgxRolesService,
    private readonly permissionService: NgxPermissionsService
  ) {}

  ngOnDestroy(): void {
    if (this.editClassDialogRef) this.editClassDialogRef.close();
    if (this.createClassDialogRef) this.createClassDialogRef.close();
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
    this.classService
      .classList(this.rows, this.first, undefined, this.searchText)
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.classes = data.results;
          this.count = data.count;
        },
        error: (error) => {
          this.loading = false;
          console.error(error);
        },
      });
  }

  public editClass(classroom: Class) {
    this.router.navigate(['/classroom', classroom.id]);
  }

  public createNew(): void {
    this.router.navigate(['/classroom/new']);
  }

  public deleteSelectedClasses() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the selected class? (' +
        this.selectedClasses?.length +
        ' selected)',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.selectedClasses) {
          return;
        }

        this.classes = this.classes.filter(
          (val) => !this.selectedClasses.includes(val)
        );

        this.selectedClasses.forEach((classroom) => {
          this.classService.classDestroy(classroom.id!).subscribe({
            next: (response) => {
              console.log(response);
              this.updatePage();
            },

            error: (error) => {
              this.showError(`Error deleting class: ${error.message}`);
            },
          });
        });
        this.selectedClasses = [];
        this.showSuccess('Classes deleted');
      },
    });
  }

  public clearSelectedClasses() {
    this.selectedClasses = [];
  }

  public deleteClass(classroom: Class) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete class ' + classroom.id + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.classService.classDestroy(classroom.id).subscribe({
          next: (response) => {
            if (this.selectedClasses) {
              this.selectedClasses = this.selectedClasses.filter(
                (val) => val.id !== classroom.id
              );
            }
            this.updatePage();
          },
          error: (error) => {
            console.error(error);
            this.showError('Failed to delete class');
          },
        });
        this.classroom = {} as Class;
        this.showSuccess('Class deleted');
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
