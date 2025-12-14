import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroCurso } from './cadastro-curso';

describe('CadastroCurso', () => {
  let component: CadastroCurso;
  let fixture: ComponentFixture<CadastroCurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroCurso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroCurso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
