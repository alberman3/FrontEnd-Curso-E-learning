import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-avaliacao-curso',
  imports: [
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './avaliacao-curso.html',
  styleUrl: './avaliacao-curso.scss',
})
export class AvaliacaoCurso {
  rating = 0;

  setRating(value: number) {
    this.rating = value;
  }
}
