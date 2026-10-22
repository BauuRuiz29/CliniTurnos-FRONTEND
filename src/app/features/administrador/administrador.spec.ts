import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministradorComponent } from './administrador';

describe('Administrador', () => {
  let component: AdministradorComponent;
  let fixture: ComponentFixture<AdministradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministradorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdministradorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
