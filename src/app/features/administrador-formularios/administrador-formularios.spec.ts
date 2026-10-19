import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministradorFormularios } from './administrador-formularios';

describe('AdministradorFormularios', () => {
  let component: AdministradorFormularios;
  let fixture: ComponentFixture<AdministradorFormularios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorFormularios],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministradorFormularios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
