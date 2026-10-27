import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { DetalleTurno } from './detalle-turno';

describe('DetalleTurno', () => {
  let component: DetalleTurno;
  let fixture: ComponentFixture<DetalleTurno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleTurno],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ turnoId: '1' }), data: { tipo: 'cancelado' } } } }],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleTurno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
