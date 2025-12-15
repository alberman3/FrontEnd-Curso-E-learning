import { Component } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-painel-cursos',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './painel-cursos.html',
  styleUrl: './painel-cursos.scss',
})
export class PainelCursos {

}
