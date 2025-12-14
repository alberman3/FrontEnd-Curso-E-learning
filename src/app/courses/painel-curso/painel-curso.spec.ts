import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelCurso } from './painel-curso';

describe('PainelCurso', () => {
  let component: PainelCurso;
  let fixture: ComponentFixture<PainelCurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelCurso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelCurso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
