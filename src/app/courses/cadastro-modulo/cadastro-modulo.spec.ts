import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroModulo } from './cadastro-modulo';

describe('CadastroModulo', () => {
  let component: CadastroModulo;
  let fixture: ComponentFixture<CadastroModulo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroModulo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroModulo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
