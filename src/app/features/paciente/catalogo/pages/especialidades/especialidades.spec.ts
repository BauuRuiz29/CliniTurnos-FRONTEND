import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Especialidades } from './especialidades';

describe('Especialidades', () => {
  let component: Especialidades;
  let fixture: ComponentFixture<Especialidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Especialidades],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Especialidades);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
