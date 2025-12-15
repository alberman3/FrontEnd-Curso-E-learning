import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cadastro-modulo',
    imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cadastro-modulo.html',
  styleUrl: './cadastro-modulo.scss',
})
export class CadastroModulo {

}
