import { Injectable } from '@angular/core';
import { decodeJwt } from 'jose';
import { UserRole } from '../enums/user-role';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService as ApiAuthService, UserService } from '../api/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly permissionService: NgxPermissionsService,
    private readonly authService: ApiAuthService,
    private readonly userService: UserService,
  ) {}
  public tokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const decodedToken = decodeJwt(token);
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

  public getRole(): UserRole {
    const token = localStorage.getItem('access_token');
    try {
      if (!token) throw new Error('Token not found');
      const decodedToken = decodeJwt(token);
      if (!decodedToken['role']) throw new Error('Role not found in token');
      const role = decodedToken['role'].toString();
      if (role !== 'user' && role !== 'staff' && role !== 'admin') {
        throw new Error('Invalid role in token');
      }
      if (role === 'user') return UserRole.User;
      if (role === 'staff') return UserRole.Staff;
      return UserRole.Admin;
    } catch (e) {
      console.error(`Error decoding token: ${e}. Defaulting to user role.`);
      return UserRole.User;
    }
  }

  public logout(): void {
    localStorage.removeItem('access_token');
  }

  public tryRefreshToken(): boolean {
    return true;
  }

  public updateRoles(callback: () => void = () => {}): void {
    console.log('Updating roles');
    this.permissionService.flushPermissions();
    this.authService.authUserRetrieve().subscribe({
      next: (user) => {
        const userId = user.pk;
        this.userService.userRetrieve(userId).subscribe({
          next: (userDetails) => {
            this.permissionService.addPermission(userDetails.permissions);
            console.log('User roles updated', userDetails.permissions);
            callback();
          },
          error: (error) => {
            console.error('Error retrieving user roles:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error updating roles:', error);
      },
    });
  }
}
