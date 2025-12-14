import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvaliacaoCurso } from './avaliacao-curso';

describe('AvaliacaoCurso', () => {
  let component: AvaliacaoCurso;
  let fixture: ComponentFixture<AvaliacaoCurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvaliacaoCurso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvaliacaoCurso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
