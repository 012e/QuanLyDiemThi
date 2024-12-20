import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { TableModule, TablePageEvent } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Subject as RxSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import {
  Class,
  ClassService,
  Student,
  StudentService,
  User,
  UserService,
} from '../../core/api';
import { noWhitespaceValidator } from '../../core/validators/no-whitespace.validator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { NgxPermissionsModule } from 'ngx-permissions';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherPickerComponent } from '../../core/components/teacher-picker/teacher-picker.component';
import { Divider, DividerModule } from 'primeng/divider';
import { StudentPickerComponent } from '../student-picker/student-picker.component';
@Component({
  selector: 'app-edit-classroom',
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
    DividerModule,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './edit-classroom.component.html',
  styleUrl: './edit-classroom.component.css',
})
export class EditClassroomComponent implements OnInit, OnDestroy {
  private readonly DEFAULT_PAGE_SIZE = 10;
  private searchText$ = new RxSubject<string>();

  public count!: number;
  public first = 0;
  public rows: number = this.DEFAULT_PAGE_SIZE;
  public searchText = '';
  public loading = false;

  public classId!: number;
  public classroom!: Class;
  public form!: FormGroup;
  public teacher: User | undefined;
  public students: Student[] = [];
  public selectedStudents: Student[] = [];

  public editing = false;
  public teacherPickerRef: DynamicDialogRef | null = null;
  public studentPickerRef: DynamicDialogRef | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly teacherService: UserService,
    private readonly studentService: StudentService,
    private readonly classService: ClassService,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [undefined],
      name: [
        undefined,
        [Validators.required, Validators.minLength(1), noWhitespaceValidator()],
      ],
      teacher: [undefined, [Validators.required]],
      teacher_id: [undefined, [Validators.required]],
    });
    this.classId = this.getClassId();

    this.classService.classRetrieve(this.classId).subscribe((data) => {
      this.form.patchValue({
        ...data,
        teacher_id: data.teacher.id,
      });

      console.log(this.form.value);

      this.teacherService
        .userRetrieve((data as any).teacher.id)
        .subscribe((data) => {
          this.teacher = data;
        });
    });

    this.loadInitialData();
    this.form.disable();
  }

  public ngOnDestroy(): void {
    if (this.teacherPickerRef) {
      this.teacherPickerRef.close();
    }
  }

  private getClassId(): number {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = Number(idStr);
    if (!idStr || isNaN(Number(idStr))) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid classroom id',
      });
      this.router.navigate(['/']);
    }
    return id;
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  public enableEditing(): void {
    this.editing = true;
    this.form.enable();
  }

  public disableEditing(): void {
    this.editing = false;
    this.form.disable();
  }

  public resetPage() {
    this.first = 0;
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
      .classStudentList(
        String(this.classId),
        this.rows,
        this.first,
        undefined,
        this.searchText
      )
      .subscribe({
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

  public getValue(event: Event) {
    return (event.target as HTMLInputElement).value;
  }

  public handleSearch(query: string) {
    this.searchText$.next(query);
  }

  public addStudents(): void {
    this.studentPickerRef = this.dialogService.open(StudentPickerComponent, {
      header: 'Select Students',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        exceptStudents: this.students,
      },
      baseZIndex: 10000,
    });

    this.studentPickerRef.onClose.subscribe((newStudents: Array<Student>) => {
      if (!newStudents) {
        return;
      }
      console.log(`Dialog returned ${newStudents}`);

      this.students.push(...newStudents);

      this.showSuccess('Students added successfully');
      console.log(this.students);
    });
  }

  public selectTeacher(): void {
    this.teacherPickerRef = this.dialogService.open(TeacherPickerComponent, {
      header: 'Select a Teacher',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        exceptTeacher: this.form.get('teacher')?.value || [],
      },
      baseZIndex: 10000,
    });

    this.teacherPickerRef.onClose.subscribe((teacher: User) => {
      if (!teacher) {
        return;
      }

      this.teacher = teacher;
      this.showSuccess('Select teacher successfully');
      this.form.get('teacher_id')?.setValue(teacher.id);
      this.form.get('teacher')?.setValue(teacher);
    });
  }

  public submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.showError('Please fill in all required fields');
      return;
    }

    const formValue: Class = this.form.value;
    console.log(this.form.value);
    this.classService.classUpdate(this.classId, formValue).subscribe({
      next: (response) => {
        console.log(response);
        this.showSuccess('Class updated successfully');
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed to update classroom');
      },
    });

    this.students.forEach((student) => {
      const newStudent = {
        ...student,
        classroom: formValue,
        classroom_id: this.classId,
      };

      this.updateStudent(newStudent);
    });

    this.disableEditing();
    this.router.navigate(['/classroom']);
  }

  public deleteStudent(index: number): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete student number ${index + 1}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const newStudent = {
          ...this.students[index],
          classroom: null,
          classroom_id: null,
        };
        console.log(newStudent);
        // this.updateStudent(newStudent);
      },
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
          (val) => !this.selectedStudents.includes(val)
        );

        this.selectedStudents.forEach((student) => {
          const newStudent = {
            ...student,
            classroom: null,
            classroom_id: null,
          };
          console.log(newStudent);
          // this.updateStudent(newStudent);
        });
        this.selectedStudents = [];
        this.showSuccess('Students Deleted');
      },
    });
  }

  public clearSelectedStudents() {
    this.selectedStudents = [];
  }

  public updateStudent(student: Student): void {
    this.studentService.studentUpdate(student.id!, student).subscribe({
      next: (response) => {
        console.log(response);
        this.updatePage();
      },

      error: (error) => {
        console.error(`Error updating student: ${error.message}`);
        this.showError(`Error deleting student: ${error.message}`);
      },
    });
  }

  public deleteClass(): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this classroom?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.classService.classDestroy(this.classId).subscribe({
          next: (value) => {
            this.showSuccess(`Successfully deleted classroom`);
            this.router.navigate(['/classroom']);
          },
          error: (error) => {
            this.showError(`Failed to delete classroom: ${error.message}`);
          },
        });

        this.students.forEach((student) => {
          const newStudent = {
            ...student,
            classroom: null,
            classroom_id: null,
          };
          console.log(newStudent);
          // this.updateStudent(newStudent);
        });
      },
    });
  }
}
