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
        label: 'Home',
        icon: 'pi pi-home',
        command: () => {
          this.router.navigate(['difficulty']);
        },
      },
      {
        label: 'Features',
        icon: 'pi pi-star',
      },
      {
        label: 'Contact',
        icon: 'pi pi-envelope',
      },
      {
        label: 'Question',
        icon: 'pi pi-question',
        command: () => {
          this.router.navigate(['question']);
        },
      },
    ];
  }
}
