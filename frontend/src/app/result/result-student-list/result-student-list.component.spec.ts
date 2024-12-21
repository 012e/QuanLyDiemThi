import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultStudentListComponent } from './result-student-list.component';

describe('ResultStudentListComponent', () => {
  let component: ResultStudentListComponent;
  let fixture: ComponentFixture<ResultStudentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultStudentListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultStudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
