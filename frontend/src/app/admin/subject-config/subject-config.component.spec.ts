import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectConfigComponent } from './subject-config.component';

describe('SubjectConfigComponent', () => {
  let component: SubjectConfigComponent;
  let fixture: ComponentFixture<SubjectConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
