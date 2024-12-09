import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import {
  Student,
  StudentService,
  SubjectService,
  UserService,
  ClassService,
  Subject,
  User,
  Class,
  Result,
  ResultsService
} from '../../core/api';
import { ScoreCreateComponent } from '../score-create/score-create.component';
import { ScoreEditorComponent } from '../score-editor/score-editor.component';
ScoreCreateComponent
@Component({
  selector: 'app-result-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    DividerModule,
    ButtonModule,
    CalendarModule,
    TableModule,
    ConfirmDialogModule,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './result-create.component.html',
  styleUrl: './result-create.component.css',
})
export class ResultCreateComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly resultsService: ResultsService,
    private readonly studentService: StudentService,
    private readonly classService: ClassService,
    private readonly userService: UserService,
    private readonly subjectService: SubjectService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly router: Router
  ) {}

  public resultForm!: FormGroup;
  public scoreCreateRef: DynamicDialogRef | null = null;

  public students: Student[] = [];
  public selectedStudents: Student[] = [];

  public classes: Class[] = [];
  public subjects: Subject[] = [];
  public teachers: User[] = [];

  public ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  public ngOnDestroy(): void {
    if (this.scoreCreateRef) {
      this.scoreCreateRef.close();
    }
  }

  public loadData(): void {
    this.userService.userList().subscribe((users) => {
      this.teachers = users.results;
    });
    this.subjectService.subjectList().subscribe((subjects) => {
      this.subjects = subjects;
    });
    this.classService.classList().subscribe((classes) => {
      this.classes = classes.results;
    });
  }

  public initForm(): void {
    this.resultForm = this.fb.group({
      id: [undefined],
      subject: [null, Validators.required],
      class: [null, [Validators.required]],
      teacher: [null, Validators.required],
      students: [[]],
    });
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

  public syncStudentsTableToForm(): void {
    const selectedStudentIds = this.students.map((student) => {
      return student.id;
    });
    this.resultForm.get('students')?.setValue(selectedStudentIds);
  }

  public updateStudents(): void {
    const studentIds: Array<number> =
      this.resultForm.get('students')?.value ?? [];

    const size = studentIds.length;
    this.students = new Array<Student>(size);
    this.clearSelectedStudents();

    studentIds.forEach((id, index) => {
      this.studentService.studentRetrieve(id).subscribe({
        next: (student) => {
          this.students[index] = student;
        },
        error: (error) => {
          this.showError(`Failed to fetch students: ${error.message}`);
          throw new Error(`Invalid state ${error}`);
        },
      });
    });
  }

  // figure out if duplicate ids are allowed
  private mergeStudentIds(
    currentStudents: Array<number>,
    newStudents: Array<number>
  ): Array<number> {
    return [...currentStudents, ...newStudents];
  }

  public addStudent(): void {
    this.scoreCreateRef = this.dialogService.open(ScoreCreateComponent, {
      header: 'Select Students',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        exceptStudents: this.resultForm.get('students')?.value || [],
      },
      baseZIndex: 10000,
    });

    this.scoreCreateRef.onClose.subscribe((newStudents: Array<number>) => {
      if (!newStudents) {
        return;
      }
      console.log(`Dialog returned ${newStudents}`);

      const currentStudents = this.resultForm.get('students')?.value || [];

      this.resultForm
        .get('students')
        ?.setValue(this.mergeStudentIds(currentStudents, newStudents));

      this.showSuccess('Students added successfully');
      console.log(`New student ids ${this.resultForm.get('students')?.value}`);
      this.updateStudents();
    });
  }

  public getFormValue(): Result {
    const data = this.resultForm.value;
    const score: Result = {
      id: data.id,
      test: data.subject,
      teacher: data.semester,
      classroom: data.datetime,
      student_results: data.students,
    };
    return score;
  }

  public submit(): void {
    this.resultForm.markAllAsTouched();
    if (this.resultForm.invalid) {
      this.showError('Form is not valid, please check the fields.');
      return;
    }
    this.resultsService.resultsCreate(this.getFormValue()).subscribe({
      next: (response) => {
        this.showSuccess('Result created successfully');
        this.router.navigate(['/result']);
      },
      error: (error) => {
        this.showError(`Failed to create result: ${error.message}`);
      },
    });
  }

  public clearSelectedStudents() {
    this.selectedStudents = [];
  }

  public getClassLabelById(index: number) {
    return this.classes.find((classroom) => classroom.id === index)
      ?.name;
  }

  public getSubjectLabelById(index: number) {
    return this.subjects.find((subject) => subject.id === index)?.name;
  }

  public getTeacherLabelById(index: number) {
    return this.teachers.find((teacher) => teacher.id === index)?.username;
  }

  public deleteStudent(index: number): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete student number ${index + 1}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.students.splice(index, 1);
        this.syncStudentsTableToForm();
        this.showSuccess('Removed student from list');
      },
    });
  }

  public editStudent(index: number): void {
    this.scoreCreateRef = this.dialogService.open(ScoreEditorComponent, {
      header: 'Edit Student',
      width: '70%',
      contentStyle: { overflow: 'auto' },
      data: {
        student: this.students[index],
      },
      baseZIndex: 10000,
    });

    this.scoreCreateRef.onClose.subscribe((student: Student) => {
      if (!student) {
        return;
      }
      console.log(`Dialog returned ${student}`);

      this.students[index] = student;
      this.syncStudentsTableToForm();
      this.showSuccess('Student updated successfully');
    });
  }
}
