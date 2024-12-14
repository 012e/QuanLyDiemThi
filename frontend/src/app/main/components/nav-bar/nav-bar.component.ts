import { Component, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/enums/user-role';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MenubarModule, ButtonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent implements OnInit {
  public items: MenuItem[] | undefined;

  public constructor(private readonly router: Router, private readonly authService: AuthService) {}

  public navigateToUser() {
    this.router.navigate(['me']);
  }

  public ngOnInit() {
    const isAdmin = this.authService.getRole() === UserRole.Admin;
    const isStaff = this.authService.getRole() === UserRole.Staff || isAdmin;
    this.items = [
      {
        label: 'Question',
        icon: 'pi pi-question',
        command: () => {
          this.router.navigate(['question']);
        },
      },
      {
        label: 'Test',
        icon: 'pi pi-list-check',
        command: () => {
          this.router.navigate(['test']);
        },
      },
      {
        label: 'Teachers',
        icon: 'pi pi-users',
        command: () => {
          this.router.navigate(['user']);
        },
      },
      {
        label: 'Summary',
        icon: 'pi pi-percentage',
        command: () => {
          this.router.navigate(['summary', new Date().getFullYear()]);
        },
        disabled: !isStaff,
      },
      {
        label: 'Admin',
        icon: 'pi pi-cog',
        command: () => {
          this.router.navigate(['admin']);
        },
        disabled: !isAdmin,
      },
      {
        label: 'Student',
        icon: 'pi pi-cog',
        command: () => {
          this.router.navigate(['student']);
        },
        disabled: !isAdmin,
      },
    ];
  }
}
