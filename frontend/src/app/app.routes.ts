import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './core/guards/is-authenticated.guard';
import { isUnauthenticatedGuard } from './core/guards/is-unauthenticated.guard';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [isAuthenticatedGuard],
    children: [
      {
        path: 'question',
        component: QuestionComponent,
      },

      {
        path: 'admin',
        component: AdminComponent,
      },
      {
        path: 'admin',
        component: AdminComponent,
      },
    ],
  },
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [isUnauthenticatedGuard],
  },
];
