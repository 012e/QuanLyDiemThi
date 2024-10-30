import { Component } from '@angular/core';
import { AuthService, Login } from '../../../core/api';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, delay } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  public username: string = '';
  public email: string = '';
  public password: string = '';
  public checked: boolean = false;
  constructor(private authService: AuthService, private messageService: MessageService, private router: Router) {}

  public handleLogin(): void {
    const loginInfo: Login = {
      username: this.username,
      password: this.password,
    };
    this.authService.authLoginCreate(loginInfo).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Login successful' });
        of(null).pipe(delay(3000)).subscribe(() => {
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        switch (error.status) {
          case 400:
            this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Invalid input' });
            break;
          case 401:
            this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Invalid credentials' });
            break;
          case 403:
            this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Forbidden' });
            break;
          case 404:
            this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Not found' });
            break;
          case 500:
            this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Server error' });
            break;
          default:
            this.messageService.add({ severity: 'error', summary: 'Error Message', detail: error.message });
        }
      },
    });
  }
}
