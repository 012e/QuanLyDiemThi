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
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Student, StudentService, Class, ClassService } from '../core/api';
import { CreateStudentComponent } from './create-student/create-student.component'; 
import { EditStudentComponent } from './edit-student/edit-student.component';
import { NgxPermissionsModule, NgxPermissionsService, NgxRolesService } from 'ngx-permissions';

@Component({
  selector: 'app-student',
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
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent implements OnInit {
  private readonly DEFAULT_PAGE_SIZE = 10;

  editStudentDialogRef: DynamicDialogRef | undefined;
  createStudentDialogRef: DynamicDialogRef | undefined;

  students!: Student[];
  student!: Student;
  classes!: Class[];

  selectedStudents!: Student[];

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
    private readonly studentService: StudentService,
    private readonly classService: ClassService,
    private readonly roleService: NgxRolesService,
    private readonly permissionService: NgxPermissionsService,
  ) {}

  ngOnDestroy(): void {
    if (this.editStudentDialogRef) this.editStudentDialogRef.close();
    if (this.createStudentDialogRef) this.createStudentDialogRef.close();
  }

  public resetPage() {
    this.first = 0;
  }

  public ngOnInit() {
    let permissions = this.permissionService.permissions$.subscribe((permissions) => {
      console.log(permissions);
    });
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

    this.loadData();
    this.updatePage();
  }

  private loadData() {
    this.classService.classList().subscribe({
      next: (data) => {
        this.classes = data.results;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    this.loading = true;
    this.studentService.studentList(this.rows, this.first, undefined).subscribe({ //this.searchText
      next: (data) => {
        this.loading = false;
        this.students = data.results;
        this.count = data.count;
      },
      error: (error) => {
        this.loading = false;
        console.error(error);
      },
    });
  }

  public openEditDialog(student: Student) {
    this.editStudentDialogRef = this.dialogService.open(EditStudentComponent, {
      header: 'Edit Student',
      data: {
        student: student,
      },
    });
    this.editStudentDialogRef.onClose.subscribe((student: Student) => {
      if (student) {
        this.updatePage();
        this.showSuccess('Student updated successfully');
      }
    });
  }

  public openCreateDialog() {
    console.log('openCreateDialog');
    this.createStudentDialogRef = this.dialogService.open(
      CreateStudentComponent,
      {
        header: 'Create New Student',
      },
    );
    console.log('createStudentDialogRef', this.createStudentDialogRef);
    this.createStudentDialogRef.onClose.subscribe((student: Student) => {
      if (student) {
        this.updatePage();
        this.showSuccess('Student created successfully');
      }
    });
  }

  public deleteSelectedStudents() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to delete the selected student? (' +
        this.selectedStudents?.length +
        ' selected)',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.selectedStudents) {
          return;
        }

        this.students = this.students.filter(
          (val) => !this.selectedStudents.includes(val),
        );

        this.selectedStudents.forEach((question: { id: number }) => {
          this.studentService.studentDestroy(question.id).subscribe({
            next: (response) => {
              console.log(response);
              this.updatePage();
            },

            error: (error) => {
              this.showError(`Error deleting question: ${error.message}`);
            },
          });
        });
        this.selectedStudents = [];
        this.showSuccess('Students Deleted');
      },
    });
  }

  public clearSelectedStudents() {
    this.selectedStudents = [];
  }

  public deleteStudent(student: Student) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete question ' + student.id + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.studentService.studentDestroy(student.id).subscribe({
          next: (_response) => {
            if (this.selectedStudents) {
              this.selectedStudents = this.selectedStudents.filter(
                (val) => val.id !== student.id,
              );
            }
            this.updatePage();
          },
          error: (error) => {
            console.error(error);
          },
        });
        this.student = {} as Student;
        this.showSuccess('Student deleted');
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
