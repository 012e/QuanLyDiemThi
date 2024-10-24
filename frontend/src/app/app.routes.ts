import { Routes } from '@angular/router';
import { LoginComponent } from './login/components/login/login.component';
import { DifficultyComponent } from './difficulty/components/difficulty/difficulty.component';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: 'difficulty',
    component: DifficultyComponent,
  },
];
