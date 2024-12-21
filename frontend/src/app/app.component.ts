import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastModule, ToastPositionType } from 'primeng/toast';
import { AuthService } from './core/services/auth.service';
import { UserRole } from './core/enums/user-role';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'app';
  constructor(
    private readonly permissionService: NgxPermissionsService,
    private readonly authService: AuthService,
  ) {}
  ngOnInit(): void {
    this.permissionService.addPermission('user', () => {
      return (
        this.authService.getRole() === UserRole.User ||
        this.authService.getRole() === UserRole.Staff ||
        this.authService.getRole() === UserRole.Admin
      );
    });
    this.permissionService.addPermission('admin', () => {
      return this.authService.getRole() === UserRole.Admin;
    });
    this.permissionService.addPermission('staff', () => {
      return (
        this.authService.getRole() === UserRole.Staff ||
        this.authService.getRole() === UserRole.Admin
      );
    });
  }
}
