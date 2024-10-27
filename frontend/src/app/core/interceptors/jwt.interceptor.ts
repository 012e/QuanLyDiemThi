import { HttpInterceptorFn } from '@angular/common/http';
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

export const JwtInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('access_token');
  if (!token) return next(request);
  if (token && !tokenExpired(token)) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(request);
};
