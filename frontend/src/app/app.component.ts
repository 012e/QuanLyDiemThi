import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastModule } from 'primeng/toast';
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
    this.authService.updateRoles();
  }
}
