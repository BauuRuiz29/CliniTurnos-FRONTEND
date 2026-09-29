import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Turnos } from './turnos';

describe('Turnos', () => {
  let component: Turnos;
  let fixture: ComponentFixture<Turnos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Turnos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Turnos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
