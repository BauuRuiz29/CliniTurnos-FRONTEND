import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { CompletarInforme } from './completar-informe';

describe('CompletarInforme', () => {
  let component: CompletarInforme;
  let fixture: ComponentFixture<CompletarInforme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletarInforme],
      providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ turnoId: '1' }), data: { tipo: 'cancelado' } } } }],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletarInforme);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
