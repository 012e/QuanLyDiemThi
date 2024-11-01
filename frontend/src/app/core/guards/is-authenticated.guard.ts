import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { jwtDecode } from 'jwt-decode';

function tokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode(token);
    if (!decodedToken.exp) return true;
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

export const isAuthenticatedGuard: CanActivateChildFn = (
  _childRoute,
  _state,
) => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  const token = localStorage.getItem('access_token');
  if (!token || tokenExpired(token)) {
    router.navigate(['auth/login']);
    messageService.add({
      severity: 'error',
      summary: 'Unauthorized',
      detail: 'You must be logged in to access this page',
    });
    return false;
  }
  return true;
};
