import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministradorFormulariosComponent } from './administrador-formularios';

describe('AdministradorFormularios', () => {
  let component: AdministradorFormulariosComponent;
  let fixture: ComponentFixture<AdministradorFormulariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorFormulariosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministradorFormulariosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
