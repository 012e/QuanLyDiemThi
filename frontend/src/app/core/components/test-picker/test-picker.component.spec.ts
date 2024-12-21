import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPickerComponent } from './test-picker.component';

describe('TestPickerComponent', () => {
  let component: TestPickerComponent;
  let fixture: ComponentFixture<TestPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
