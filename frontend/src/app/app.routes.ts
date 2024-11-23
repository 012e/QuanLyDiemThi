import { Routes } from '@angular/router';
import { LoginComponent } from './login/components/login/login.component';
import { DifficultyComponent } from './difficulty/components/difficulty/difficulty.component';
import { MainComponent } from './main/components/main/main.component';
import { isAuthenticatedGuard } from './core/guards/is-authenticated.guard';
import { isUnauthenticatedGuard } from './core/guards/is-unauthenticated.guard';
import { QuestionComponent } from './question/question.component';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [isAuthenticatedGuard],
    children: [
      {
        path: 'difficulty',
        component: DifficultyComponent,
      },

      {
        path: 'question',
        component: QuestionComponent,
      },
      {
        path: 'me',
        component: UserComponent,
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
