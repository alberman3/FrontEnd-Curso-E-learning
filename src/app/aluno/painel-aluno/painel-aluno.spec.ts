import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelAluno } from './painel-aluno';

describe('PainelAluno', () => {
  let component: PainelAluno;
  let fixture: ComponentFixture<PainelAluno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelAluno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelAluno);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
