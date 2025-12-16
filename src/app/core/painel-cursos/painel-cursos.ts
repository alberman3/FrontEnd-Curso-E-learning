import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CoursesService } from '../../courses/services/courses-services';
import { Course } from '../../courses/model/course';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-painel-cursos',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './painel-cursos.html',
  styleUrl: './painel-cursos.scss',
})
export class PainelCursos implements OnInit {
  cursos = signal<Course[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed signal para filtrar cursos
  cursosFiltered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.cursos();
    return this.cursos().filter(curso =>
      curso.title.toLowerCase().includes(term)
    );
  });

  constructor(
    private coursesService: CoursesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCursos();
  }

  loadCursos(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.coursesService.list().subscribe({
      next: (data) => {
        this.cursos.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar cursos:', err);
        this.error.set('Erro ao carregar cursos');
        this.isLoading.set(false);
      }
    });
  }

  filterCursos(term: string): void {
    this.searchTerm.set(term);
  }

  goToCourse(courseId: number): void {
    this.router.navigate(['/cursos', courseId]);
  }
}
