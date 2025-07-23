import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMngComponent } from './user-mng.component';

describe('UserMngComponent', () => {
  let component: UserMngComponent;
  let fixture: ComponentFixture<UserMngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMngComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserMngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
