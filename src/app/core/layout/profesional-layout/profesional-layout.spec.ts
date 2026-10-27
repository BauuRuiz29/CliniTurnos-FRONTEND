import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfesionalLayout } from './profesional-layout';

describe('ProfesionalLayout', () => {
  let component: ProfesionalLayout;
  let fixture: ComponentFixture<ProfesionalLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalLayout],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
