import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreEditorComponent } from './score-editor.component';

describe('ScoreEditorComponent', () => {
  let component: ScoreEditorComponent;
  let fixture: ComponentFixture<ScoreEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
