import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedTextTooltipContainerComponent } from './selected-text-tooltip-container.component';

describe('SelectedTextTooltipContainerComponent', () => {
  let component: SelectedTextTooltipContainerComponent;
  let fixture: ComponentFixture<SelectedTextTooltipContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectedTextTooltipContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedTextTooltipContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
