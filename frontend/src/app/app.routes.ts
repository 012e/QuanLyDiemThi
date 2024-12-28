import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './core/guards/is-authenticated.guard';
import { isUnauthenticatedGuard } from './core/guards/is-unauthenticated.guard';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/components/login/login.component';
import { MainComponent } from './main/components/main/main.component';
import { QuestionComponent } from './question/question.component';
import { TestCreateComponent } from './test/test-create/test-create.component';
import { TestDetailComponent } from './test/test-detail/test-detail.component';
import { TestListComponent } from './test/test-list/test-list.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { SummaryComponent } from './summary/summary.component';
import { StudentComponent } from './student/student.component';
import { CreateStudentComponent } from './student/create-student/create-student.component';
import { EditStudentComponent } from './student/edit-student/edit-student.component';
import { ClassroomComponent } from './classroom/classroom.component';
import { CreateClassroomComponent } from './classroom/create-classroom/create-classroom.component';
import { EditClassroomComponent } from './classroom/edit-classroom/edit-classroom.component';
import { ResultListComponent } from './result/result-list/result-list.component';
import { ResultCreateComponent } from './result/result-create/result-create.component';
import { ResultEditComponent } from './result/result-edit/result-edit.component';
import { ngxPermissionsGuard, NgxPermissionsGuard } from 'ngx-permissions';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    title: 'Score Manager',
    canActivate: [isAuthenticatedGuard],
    children: [
      {
        path: 'summary/:year',
        component: SummaryComponent,
        data: {
          permissions: {
            only: ['summary:view'],
            redirectTo: '/me',
          },
        }
      },
      {
        path: 'question',
        component: QuestionComponent,
        data: {
          permissions: {
            only: ['question:view'],
            redirectTo: '/me',
          },
        }
      },
      {
        path: 'me',
        component: UserInfoComponent,
      },
      {
        path: 'user',
        component: UserListComponent,
        canActivate: [ngxPermissionsGuard],
        data: {
          permissions: {
            only: ['user:view'],
            redirectTo: '/me',
          },
        }
      },
      {
        path: 'admin',
        component: AdminComponent,
        data: {
          permissions: {
            only: ['admin'],
            redirectTo: '/me',
          },
        }
      },
      {
        path: 'test',
        component: TestListComponent,
        data: {
          permissions: {
            only: ['test:view'],
            redirectTo: '/me',
          },
        }
      },
      {
        path: 'test/new',
        component: TestCreateComponent,
      },
      {
        path: 'test/:id',
        component: TestDetailComponent,
      },
      {
        path: 'student',
        component: StudentComponent,
        data: {
          permissions: {
            only: ['student:view'],
            redirectTo: '/me',
          },
        }
      },
      {
        path: 'student/new',
        component: CreateStudentComponent,
      },
      {
        path: 'student/:id',
        component: EditStudentComponent,
      },
      {
        path: 'classroom',
        component: ClassroomComponent,
        data: {
          permissions: {
            only: ['classroom:view'],
            redirectTo: '/me',
          },
        }
      },
      {
        path: 'classroom/new',
        component: CreateClassroomComponent,
      },
      {
        path: 'classroom/:id',
        component: EditClassroomComponent,
      },
      {
        path: 'result',
        component: ResultListComponent,
      },
      {
        path: 'result/new',
        component: ResultCreateComponent,
      },
      {
        path: 'result/:id',
        component: ResultEditComponent,
      },
    ],
  },
  {
    path: 'auth/login',
    title: 'Login',
    component: LoginComponent,
    canActivate: [isUnauthenticatedGuard],
  },
];
