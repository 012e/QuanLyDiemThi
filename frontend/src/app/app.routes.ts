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

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [isAuthenticatedGuard],
    children: [
      {
        path: 'summary/:year',
        component: SummaryComponent,
        title: 'Yearly Summary',
      },
      {
        path: 'question',
        component: QuestionComponent,
      },
      {
        path: 'me',
        component: UserInfoComponent,
      },
      {
        path: 'user',
        component: UserListComponent,
      },
      {
        path: 'admin',
        component: AdminComponent,
      },
      {
        path: 'test',
        component: TestListComponent,
      },
      {
        path: 'test/new',
        component: TestCreateComponent,
      },
      {
        path: 'test/:id',
        component: TestDetailComponent,
      },
    ],
  },
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [isUnauthenticatedGuard],
  },
];
