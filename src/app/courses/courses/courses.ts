import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { Course } from '../model/course';
import { CoursesService } from '../services/courses-services';
// CORREÇÃO 1: Consolidação e importação do 'Observable' e dos operadores necessários.
import { catchError, Observable, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../shared/components/error-dialog/error-dialog';// Ajustado o nome para convenção e uso como Standalone
import { MatIconModule } from '@angular/material/icon';
import { CategoryPipe } from '../../shared/pipes/category-pipe';

/**
 * Decorador que define esta classe como um Componente Angular.
 */
@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    CategoryPipe
    // Se ErrorDialogComponent for um componente standalone, ele também seria importado aqui,
    // mas no momento, ele é aberto via MatDialog e não precisa estar no 'imports' do componente.
  ],
  templateUrl: './courses.html',
  styleUrl: './courses.scss'
})
export class Courses implements OnInit {

  courses$: Observable<Course[]>;
  displayedColumns: string[] = ['name', 'category'];

  constructor(
    private courseService: CoursesService,
    public dialog: MatDialog // Serviço injetado para abrir o Dialog
  ) {
    this.courses$ = this.courseService.list()
      .pipe(
        // Se houver um erro na requisição (AJAX), o método onError é chamado
        catchError(error => {
          this.onError('Erro ao carregar a lista de cursos.');
          // Retorna um Observable vazio para o 'courses$', permitindo que o *ngIf else loading
          // seja exibido no template, mas sem tentar renderizar dados na tabela.
          return of([]);
        })
      );
  }

  // CORREÇÃO 2: Implementação do método onError() referenciado no construtor
  onError(errorMsg: string) {
    this.dialog.open(ErrorDialogComponent, { // Use ErrorDialogComponent
      data: errorMsg,
      width: '350px',
      maxHeight: '200px'
    });
  }

  ngOnInit(): void {
    // A chamada para carregar os dados (this.courseService.list()) já foi feita no construtor.
    // O OnInit geralmente não é necessário neste padrão, mas deve ser mantido se a interface for implementada.
  }
}
