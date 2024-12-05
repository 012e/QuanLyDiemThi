import { Component, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MenubarModule, ButtonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent implements OnInit {
  public items: MenuItem[] | undefined;

  public constructor(private readonly router: Router) {}

  public navigateToUser() {
    this.router.navigate(['me']);
  }

  public ngOnInit() {
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
        label: 'Admin',
        icon: 'pi pi-cog',
        command: () => {
          this.router.navigate(['admin']);
        },
      },
    ];
  }
}
