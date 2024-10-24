import { Routes } from '@angular/router';
import { LoginComponent } from './login/components/login/login.component';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent,
  },
];
