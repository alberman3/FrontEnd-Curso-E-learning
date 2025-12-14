import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-tela-inicial',
  standalone: true,
  imports: [
    RouterModule,
  ],
  templateUrl: './tela-inicial.html',
  styleUrl: './tela-inicial.scss',
})
export class TelaInicial {

}
