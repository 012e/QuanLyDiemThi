import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const isUnauthenticatedGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isLoggedIn()) {
    console.warn('User is already authenticated, redirecting to main page.');
    router.navigate(['']);
    return false;
  }

  return true;
};
