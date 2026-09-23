import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformesMedicos } from './informes-medicos';

describe('InformesMedicos', () => {
  let component: InformesMedicos;
  let fixture: ComponentFixture<InformesMedicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformesMedicos],
    }).compileComponents();

    fixture = TestBed.createComponent(InformesMedicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
