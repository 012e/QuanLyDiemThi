import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassPickerComponent } from './class-picker.component';

describe('ClassPickerComponent', () => {
  let component: ClassPickerComponent;
  let fixture: ComponentFixture<ClassPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
