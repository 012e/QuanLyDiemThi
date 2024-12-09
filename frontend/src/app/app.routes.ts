import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './core/guards/is-authenticated.guard';
import { isUnauthenticatedGuard } from './core/guards/is-unauthenticated.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./main/components/main/main.component').then((m) => m.MainComponent),
    canActivate: [isAuthenticatedGuard],
    children: [
      {
        path: 'question',
        loadComponent: () => import('./question/question.component').then((m) => m.QuestionComponent),
      },
      {
        path: 'me',
        loadComponent: () => import('./user-info/user-info.component').then((m) => m.UserInfoComponent),
      },
      {
        path: 'user',
        loadComponent: () => import('./user/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'admin',
        loadComponent: () => import('./admin/admin.component').then((m) => m.AdminComponent),
      },
      {
        path: 'test',
        loadComponent: () => import('./test/test-list/test-list.component').then((m) => m.TestListComponent),
      },
      {
        path: 'test/new',
        loadComponent: () => import('./test/test-create/test-create.component').then((m) => m.TestCreateComponent),
      },
      {
        path: 'test/:id',
        loadComponent: () => import('./test/test-detail/test-detail.component').then((m) => m.TestDetailComponent),
      },
    ],
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./login/components/login/login.component').then((m) => m.LoginComponent),
    canActivate: [isUnauthenticatedGuard],
  },
];
