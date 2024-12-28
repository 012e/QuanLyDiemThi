import { Component, OnInit } from '@angular/core';
import {
  Permission,
  PermissionService,
  Role,
  RoleService,
} from '../../core/api';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { PickListModule } from 'primeng/picklist';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-role-edit',
  standalone: true,
  imports: [PickListModule, ButtonModule],
  templateUrl: './role-edit.component.html',
  styleUrl: './role-edit.component.css',
})
export class RoleEditComponent implements OnInit {
  permissions: Permission[] = [];
  selectedPermissions: Permission[] = [];
  currentRole!: Role;
  self: DynamicDialogComponent | undefined;
  constructor(
    public selfRef: DynamicDialogRef,
    dialogService: DialogService,
    private readonly roleService: RoleService,
    private readonly messageService: MessageService,
    private readonly permissionService: PermissionService,
  ) {
    this.self = dialogService.getInstance(selfRef);
  }

  ngOnInit(): void {
    this.currentRole = this.self!.data.role;

    if (!this.currentRole) {
      throw new Error('Role not found in dialog data');
    }

    this.selectedPermissions = this.currentRole.permissions.map(
      (permission) => ({ name: permission }) as Permission,
    );

    this.permissionService.permissionList().subscribe({
      next: (response) => {
        let unfilteredPerms = response;
        this.permissions = unfilteredPerms.filter(
          (perm: Permission) =>
            !this.selectedPermissions.some((inner) => inner.name === perm.name),
        );
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load permissions',
        });
      },
    });
  }

  submit(): void {
    this.currentRole.permissions = this.selectedPermissions.map(
      (permission) => permission.name,
    );

    this.roleService
      .roleUpdate(this.currentRole.id, this.currentRole)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Role updated',
          });
          this.selfRef.close(this.currentRole);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update role',
          });
        },
      });
  }
}
