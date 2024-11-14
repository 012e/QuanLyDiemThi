import {
  HttpErrorResponse,
  HttpEventType,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const UnauthorizedInterceptorInterceptor: HttpInterceptorFn = (
  req,
  next,
) => {
  const messageService = inject(MessageService);
  const router = inject(Router);
  const authService = inject(AuthService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (authService.isLoggedIn()) {
          messageService.add({
            severity: 'error',
            summary: 'Error Message',
            detail: 'Unauthorized action.',
          });
          router.navigate(['/']);
        } else {
          messageService.add({
            severity: 'error',
            summary: 'Error Message',
            detail: 'User not logged in. Redirecting to login page.',
          });
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};
