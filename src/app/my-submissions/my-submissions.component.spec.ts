import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySubmissionsComponent } from './my-submissions.component';

describe('MySubmissionsComponent', () => {
  let component: MySubmissionsComponent;
  let fixture: ComponentFixture<MySubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySubmissionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MySubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
