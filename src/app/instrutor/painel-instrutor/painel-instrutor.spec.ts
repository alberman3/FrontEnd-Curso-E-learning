import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelInstrutor } from './painel-instrutor';

describe('PainelInstrutor', () => {
  let component: PainelInstrutor;
  let fixture: ComponentFixture<PainelInstrutor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelInstrutor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelInstrutor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
