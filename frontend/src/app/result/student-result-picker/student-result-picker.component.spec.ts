import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentResultPickerComponent } from './student-result-picker.component';

describe('StudentResultPickerComponent', () => {
  let component: StudentResultPickerComponent;
  let fixture: ComponentFixture<StudentResultPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentResultPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentResultPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
