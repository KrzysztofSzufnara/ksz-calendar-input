import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KKalendarInputComponent } from './k-kalendar-input.component';

describe('KKalendarInputComponent', () => {
  let component: KKalendarInputComponent;
  let fixture: ComponentFixture<KKalendarInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KKalendarInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KKalendarInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
