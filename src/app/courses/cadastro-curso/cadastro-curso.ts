import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cadastro-curso',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './cadastro-curso.html',
  styleUrl: './cadastro-curso.scss',
})
export class CadastroCurso {

}
