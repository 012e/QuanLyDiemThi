import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DifficultyConfigComponent } from './difficulty-config.component';

describe('DifficultyConfigComponent', () => {
  let component: DifficultyConfigComponent;
  let fixture: ComponentFixture<DifficultyConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DifficultyConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DifficultyConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
