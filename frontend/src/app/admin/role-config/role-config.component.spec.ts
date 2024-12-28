import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleConfigComponent } from './role-config.component';

describe('RoleConfigComponent', () => {
  let component: RoleConfigComponent;
  let fixture: ComponentFixture<RoleConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
