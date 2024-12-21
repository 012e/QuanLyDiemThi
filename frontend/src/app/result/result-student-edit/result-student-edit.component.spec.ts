import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultStudentEditComponent } from './result-student-edit.component';

describe('ResultStudentEditComponent', () => {
  let component: ResultStudentEditComponent;
  let fixture: ComponentFixture<ResultStudentEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultStudentEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultStudentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
