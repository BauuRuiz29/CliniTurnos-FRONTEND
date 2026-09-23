import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacienteLayout } from './paciente-layout';

describe('PacienteLayout', () => {
  let component: PacienteLayout;
  let fixture: ComponentFixture<PacienteLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(PacienteLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
