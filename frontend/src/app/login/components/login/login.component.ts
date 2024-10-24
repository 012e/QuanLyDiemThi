import { Component } from '@angular/core';
import { AuthService, Login } from '../../../core/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  public username: string = '';
  public email: string = '';
  public password: string = '';
  constructor(private authService: AuthService) {}

  public handleLogin(): void {
    const loginInfo: Login = {
      username: this.username,
      password: this.password,
    };
    this.authService.authLoginCreate(loginInfo).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        alert('Login successful');
      },
      error: (error) => {
        alert('Login failed: ' + error.message);
      },
    });
  }
}
