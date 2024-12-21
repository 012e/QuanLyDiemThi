import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultStudentCreateComponent } from './result-student-create.component';

describe('ResultStudentCreateComponent', () => {
  let component: ResultStudentCreateComponent;
  let fixture: ComponentFixture<ResultStudentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultStudentCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultStudentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
