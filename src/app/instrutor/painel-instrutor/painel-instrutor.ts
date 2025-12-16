import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { CoursesService } from '../../courses/services/courses-services';
import { AuthService } from '../../auth/services/auth-services';
import { Course } from '../../courses/model/course';

@Component({
  selector: 'app-painel-instrutor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    NavbarComponent
  ],
  template: `
    <!-- Navbar -->
    <app-navbar></app-navbar>

    <div class="painel-instrutor-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1>Painel do Instrutor</h1>
          <p>Bem-vindo, {{ authService.userName() }}!</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createNewCourse()">
            <mat-icon>add</mat-icon>
            Novo Curso
          </button>
        </div>
      </header>

      <!-- Stats Cards -->
      <div class="stats-container">
        <mat-card class="stat-card">
          <mat-icon>school</mat-icon>
          <div class="stat-info">
            <h3>{{ courses().length }}</h3>
            <p>Cursos Criados</p>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon>menu_book</mat-icon>
          <div class="stat-info">
            <h3>{{ getTotalModules() }}</h3>
            <p>Módulos</p>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon>schedule</mat-icon>
          <div class="stat-info">
            <h3>{{ getTotalWorkload() }}h</h3>
            <p>Carga Horária Total</p>
          </div>
        </mat-card>
      </div>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Carregando seus cursos...</p>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-raised-button color="primary" (click)="loadCourses()">
            Tentar Novamente
          </button>
        </div>
      }

      <!-- Courses List -->
      @if (!isLoading() && !error()) {
        <section class="courses-section">
          <h2>
            <mat-icon>library_books</mat-icon>
            Meus Cursos
          </h2>

          @if (courses().length === 0) {
            <div class="empty-state">
              <mat-icon>school</mat-icon>
              <h3>Nenhum curso criado ainda</h3>
              <p>Comece criando seu primeiro curso e compartilhe seu conhecimento!</p>
              <button mat-raised-button color="primary" (click)="createNewCourse()">
                <mat-icon>add</mat-icon>
                Criar Primeiro Curso
              </button>
            </div>
          } @else {
            <div class="courses-grid">
              @for (course of courses(); track course.id) {
                <mat-card class="course-card">
                  <mat-card-header>
                    <mat-card-title>{{ course.title }}</mat-card-title>
                    <mat-card-subtitle>
                      <mat-chip-set>
                        @for (cat of course.categories; track cat.id) {
                          <mat-chip>{{ cat.name }}</mat-chip>
                        }
                      </mat-chip-set>
                    </mat-card-subtitle>
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="viewCourse(course.id)">
                        <mat-icon>visibility</mat-icon>
                        <span>Visualizar</span>
                      </button>
                      <button mat-menu-item (click)="editCourse(course.id)">
                        <mat-icon>edit</mat-icon>
                        <span>Editar</span>
                      </button>
                      <button mat-menu-item (click)="addModule(course.id)">
                        <mat-icon>add_box</mat-icon>
                        <span>Adicionar Módulo</span>
                      </button>
                      <button mat-menu-item (click)="deleteCourse(course.id)" class="delete-option">
                        <mat-icon>delete</mat-icon>
                        <span>Excluir</span>
                      </button>
                    </mat-menu>
                  </mat-card-header>

                  <mat-card-content>
                    <p>{{ course.description }}</p>

                    <div class="course-stats">
                      <div class="stat">
                        <mat-icon>schedule</mat-icon>
                        <span>{{ course.workload }}h</span>
                      </div>
                      <div class="stat">
                        <mat-icon>menu_book</mat-icon>
                        <span>{{ course.modules?.length || 0 }} módulos</span>
                      </div>
                    </div>
                  </mat-card-content>

                  <mat-card-actions>
                    <button mat-button (click)="viewCourse(course.id)">
                      <mat-icon>visibility</mat-icon>
                      Visualizar
                    </button>
                    <button mat-button color="primary" (click)="editCourse(course.id)">
                      <mat-icon>edit</mat-icon>
                      Editar
                    </button>
                    <button mat-button color="accent" (click)="addModule(course.id)">
                      <mat-icon>add</mat-icon>
                      Módulo
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styleUrl: './painel-instrutor.scss',
})
export class PainelInstrutor implements OnInit {
  courses = signal<Course[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private coursesService: CoursesService,
    public authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    const userId = this.authService.userId();
    if (!userId) {
      this.error.set('Instrutor não identificado');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.coursesService.getInstructorCourses(userId).subscribe({
      next: (data) => {
        this.courses.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar cursos:', err);
        this.error.set('Erro ao carregar seus cursos');
        this.isLoading.set(false);
      }
    });
  }

  createNewCourse(): void {
    this.router.navigate(['/cadastro-curso']);
  }

  editCourse(courseId: number): void {
    this.router.navigate(['/cadastro-curso'], { queryParams: { id: courseId } });
  }

  addModule(courseId: number): void {
    this.router.navigate(['/cadastro-modulo'], { queryParams: { courseId } });
  }

  viewCourse(courseId: number): void {
    this.router.navigate(['/cursos', courseId]);
  }

  deleteCourse(courseId: number): void {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      this.coursesService.delete(courseId).subscribe({
        next: () => {
          this.loadCourses();
        },
        error: (err) => {
          console.error('Erro ao excluir curso:', err);
          alert('Erro ao excluir curso');
        }
      });
    }
  }

  getTotalModules(): number {
    return this.courses().reduce((total, course) =>
      total + (course.modules?.length || 0), 0
    );
  }

  getTotalWorkload(): number {
    return this.courses().reduce((total, course) =>
      total + course.workload, 0
    );
  }
}
