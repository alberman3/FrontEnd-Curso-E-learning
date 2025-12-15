import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cadastro-aula',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cadastro-aula.html',
  styleUrl: './cadastro-aula.scss',
})
export class CadastroAula {

}
