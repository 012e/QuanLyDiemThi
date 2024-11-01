import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public tokenExpired(token: string): boolean {
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

  public isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token || this.tokenExpired(token)) return false;
    return true;
  }

  public tryRefreshToken(): boolean {
    return true;
  }
}
