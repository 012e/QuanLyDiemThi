import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherPickerComponent } from './teacher-picker.component';

describe('TeacherPickerComponent', () => {
  let component: TeacherPickerComponent;
  let fixture: ComponentFixture<TeacherPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
