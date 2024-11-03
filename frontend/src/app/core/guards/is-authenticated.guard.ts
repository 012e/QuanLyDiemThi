import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

export const isAuthenticatedGuard: CanActivateFn = (_childRoute, _state) => {
  const router = inject(Router);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) return true;

  router.navigate(['auth/login']);
  messageService.add({
    severity: 'error',
    summary: 'Unauthorized',
    detail: 'You must be logged in to access this page',
  });
  return false;
};
