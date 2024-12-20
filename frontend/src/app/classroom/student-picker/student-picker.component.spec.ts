import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPickerComponent } from './student-picker.component';

describe('StudentPickerComponent', () => {
  let component: StudentPickerComponent;
  let fixture: ComponentFixture<StudentPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
