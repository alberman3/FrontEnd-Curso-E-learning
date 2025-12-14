import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroAula } from './cadastro-aula';

describe('CadastroAula', () => {
  let component: CadastroAula;
  let fixture: ComponentFixture<CadastroAula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroAula]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroAula);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
