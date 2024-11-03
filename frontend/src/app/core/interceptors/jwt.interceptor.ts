import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const JwtInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('access_token');
  const authService = inject(AuthService);

  // invalid token, no need to send it
  if (!token || authService.tokenExpired(token)) {
    return next(request);
  }

  request = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(request);
};
