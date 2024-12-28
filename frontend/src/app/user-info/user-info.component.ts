import { Component, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { UserRole } from '../core/enums/user-role';
import { AuthService } from '../core/services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService as ApiAuthService, UserDetails } from '../core/api';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [DividerModule, InputTextModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css',
})
export class UserInfoComponent implements OnInit {
  public userRole!: string;
  public userDetails!: UserDetails;
  public userDetailsForm!: FormGroup;
  public editing = false;

  public constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly authApiService: ApiAuthService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
  ) {}

  public roleToString(role: UserRole): string {
    switch (role) {
      case UserRole.User:
        return 'User';
      case UserRole.Staff:
        return 'Staff';
      case UserRole.Admin:
        return 'Admin';
      default:
        return 'Unknown';
    }
  }

  public logout(): void {
    this.authService.logout();
    this.messageService.add({
      severity: 'success',
      summary: 'Logged out',
      detail: 'You have been logged out successfully.',
    });
    this.router.navigate(['/auth/login']);
  }

  public initForm(): void {
    this.userDetailsForm = this.fb.group({
      username: [''],
      email: [''],
      firstName: [''],
      lastName: [''],
    });
    this.userDetailsForm.disable();
  }

  public ngOnInit(): void {
    this.initForm();
    this.userRole = this.roleToString(this.authService.getRole());

    this.authApiService.authUserRetrieve().subscribe({
      next: (userDetails) => {
        this.userDetails = userDetails;
        this.userDetailsForm.patchValue({
          username: userDetails.username,
          email: userDetails.email,
          firstName: userDetails.first_name,
          lastName: userDetails.last_name,
        });
      },
      error: (error) => {
        console.error('Error retrieving user details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error retrieving user details',
          detail: 'An error occurred while retrieving user details.',
        });
      },
    });
  }

  public enableEditing() {
    this.editing = true;
    this.userDetailsForm.enable();
    this.userDetailsForm.get('email')?.disable();
  }

  public saveChanges() {
    this.editing = false;
    this.authApiService
      .authUserPartialUpdate({
        username: this.userDetailsForm.get('username')?.value,
        first_name: this.userDetailsForm.get('firstName')?.value,
        last_name: this.userDetailsForm.get('lastName')?.value,
      })
      .subscribe({
        next: (userDetails) => {
          this.userDetails = userDetails;
          this.userDetailsForm.patchValue({
            username: userDetails.username,
            email: userDetails.email,
            firstName: userDetails.first_name,
            lastName: userDetails.last_name,
          });
          this.messageService.add({
            severity: 'success',
            summary: 'User details updated',
            detail: 'User details have been updated successfully.',
          });
        },
        error: (error) => {
          console.error('Error updating user details:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error updating user details',
            detail: 'An error occurred while updating user details.',
          });
        },
      });
    this.userDetailsForm.disable();
  }
}
