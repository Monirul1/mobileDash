import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerPaneComponent } from './info-pane.component';

describe('TimerPaneComponent', () => {
  let component: TimerPaneComponent;
  let fixture: ComponentFixture<TimerPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimerPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimerPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
