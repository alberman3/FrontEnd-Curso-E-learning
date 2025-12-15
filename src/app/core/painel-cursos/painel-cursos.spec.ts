import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelCursos } from './painel-cursos';

describe('PainelCursos', () => {
  let component: PainelCursos;
  let fixture: ComponentFixture<PainelCursos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelCursos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelCursos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
