import { Component, OnInit } from '@angular/core';
import { AuthService, Login } from '../../../core/api';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService as AppAuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    CheckboxModule,
    ButtonModule,
    RippleModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  public username = '';
  public email = '';
  public password = '';
  public checked = false;
  constructor(
    private readonly authService: AuthService,
    private readonly appAuthService: AppAuthService,
    private readonly messageService: MessageService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    console.log('Please login');
  }

  public handleLogin(): void {
    const loginInfo: Login = {
      username: this.username,
      password: this.password,
    };
    this.authService.authLoginCreate(loginInfo).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        this.messageService.add({
          severity: 'success',
          summary: 'Success Message',
          detail: 'Login successful',
        });
        this.appAuthService.updateRoles(() => {
          this.router.navigate(['/me']);
        });
      },
      error: (error) => {
        switch (error.status) {
          case 400:
            this.messageService.add({
              severity: 'error',
              summary: 'Error Message',
              detail: 'Wrong username or password',
            });
            break;
          case 401:
            this.messageService.add({
              severity: 'error',
              summary: 'Error Message',
              detail: 'Invalid credentials',
            });
            break;
          case 403:
            this.messageService.add({
              severity: 'error',
              summary: 'Error Message',
              detail: 'Forbidden',
            });
            break;
          case 404:
            this.messageService.add({
              severity: 'error',
              summary: 'Error Message',
              detail: 'Not found',
            });
            break;
          case 500:
            this.messageService.add({
              severity: 'error',
              summary: 'Error Message',
              detail: 'Server error',
            });
            break;
          default:
            this.messageService.add({
              severity: 'error',
              summary: 'Error Message',
              detail: error.message,
            });
        }
      },
    });
  }
}
