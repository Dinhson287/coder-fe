import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlgorithmMngComponent } from './algorithm-mng.component';

describe('AlgorithmMngComponent', () => {
  let component: AlgorithmMngComponent;
  let fixture: ComponentFixture<AlgorithmMngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlgorithmMngComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlgorithmMngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
