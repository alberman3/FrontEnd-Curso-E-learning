import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { CoursesService, StudentCourse } from '../../courses/services/courses-services';
import { AuthService } from '../../auth/services/auth-services';

@Component({
  selector: 'app-painel-aluno',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    NavbarComponent
  ],
  template: `
    <!-- Navbar -->
    <app-navbar></app-navbar>

    <div class="painel-aluno-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1>Meu Painel de Estudos</h1>
          <p>Bem-vindo, {{ authService.userName() }}!</p>
        </div>
      </header>

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

      <!-- Content -->
      @if (!isLoading() && !error()) {
        <div class="content">
          <!-- Cursos em Andamento -->
          <section class="courses-section">
            <h2>
              <mat-icon>play_circle</mat-icon>
              Cursos em Andamento ({{ coursesInProgress().length }})
            </h2>

            @if (coursesInProgress().length === 0) {
              <p class="empty-message">Você ainda não começou nenhum curso.</p>
            } @else {
              <div class="courses-grid">
                @for (item of coursesInProgress(); track item.course.id) {
                  <mat-card class="course-card">
                    <mat-card-header>
                      <mat-card-title>{{ item.course.title }}</mat-card-title>
                      <mat-card-subtitle>
                        <mat-chip-set>
                          @for (cat of item.course.categories; track cat.id) {
                            <mat-chip>{{ cat.name }}</mat-chip>
                          }
                        </mat-chip-set>
                      </mat-card-subtitle>
                    </mat-card-header>

                    <mat-card-content>
                      <p>{{ item.course.description }}</p>

                      <div class="progress-info">
                        <span>Progresso: {{ item.progress }}%</span>
                        <mat-progress-bar
                          mode="determinate"
                          [value]="item.progress">
                        </mat-progress-bar>
                      </div>

                      <div class="course-info">
                        <span>
                          <mat-icon>schedule</mat-icon>
                          {{ item.course.workload }}h
                        </span>
                        <span>
                          <mat-icon>school</mat-icon>
                          {{ item.course.instructors[0]?.name }}
                        </span>
                      </div>
                    </mat-card-content>

                    <mat-card-actions>
                      <button
                        mat-raised-button
                        color="primary"
                        (click)="goToCourse(item.course.id)">
                        Continuar
                      </button>
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </section>

          <!-- Cursos Não Iniciados -->
          <section class="courses-section">
            <h2>
              <mat-icon>book</mat-icon>
              Meus Cursos ({{ coursesNotStarted().length }})
            </h2>

            @if (coursesNotStarted().length === 0) {
              <p class="empty-message">Você não tem cursos pendentes.</p>
            } @else {
              <div class="courses-grid">
                @for (item of coursesNotStarted(); track item.course.id) {
                  <mat-card class="course-card">
                    <mat-card-header>
                      <mat-card-title>{{ item.course.title }}</mat-card-title>
                      <mat-card-subtitle>
                        <mat-chip-set>
                          @for (cat of item.course.categories; track cat.id) {
                            <mat-chip>{{ cat.name }}</mat-chip>
                          }
                        </mat-chip-set>
                      </mat-card-subtitle>
                    </mat-card-header>

                    <mat-card-content>
                      <p>{{ item.course.description }}</p>

                      <div class="course-info">
                        <span>
                          <mat-icon>schedule</mat-icon>
                          {{ item.course.workload }}h
                        </span>
                        <span>
                          <mat-icon>school</mat-icon>
                          {{ item.course.instructors[0]?.name }}
                        </span>
                      </div>
                    </mat-card-content>

                    <mat-card-actions>
                      <button
                        mat-raised-button
                        color="accent"
                        (click)="goToCourse(item.course.id)">
                        Começar Agora
                      </button>
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </section>

          <!-- Cursos Concluídos -->
          <section class="courses-section">
            <h2>
              <mat-icon>check_circle</mat-icon>
              Cursos Concluídos ({{ coursesCompleted().length }})
            </h2>

            @if (coursesCompleted().length === 0) {
              <p class="empty-message">Você ainda não concluiu nenhum curso.</p>
            } @else {
              <div class="courses-grid">
                @for (item of coursesCompleted(); track item.course.id) {
                  <mat-card class="course-card completed">
                    <mat-card-header>
                      <mat-card-title>
                        {{ item.course.title }}
                        <mat-icon class="completed-icon">verified</mat-icon>
                      </mat-card-title>
                      <mat-card-subtitle>
                        <mat-chip-set>
                          @for (cat of item.course.categories; track cat.id) {
                            <mat-chip>{{ cat.name }}</mat-chip>
                          }
                        </mat-chip-set>
                      </mat-card-subtitle>
                    </mat-card-header>

                    <mat-card-content>
                      <p>{{ item.course.description }}</p>

                      <div class="course-info">
                        <span>
                          <mat-icon>schedule</mat-icon>
                          {{ item.course.workload }}h
                        </span>
                        <span>
                          <mat-icon>event</mat-icon>
                         
                        </span>
                      </div>
                    </mat-card-content>

                    <mat-card-actions>
                      <button
                        mat-raised-button
                        (click)="goToCourse(item.course.id)">
                        Revisar
                      </button>
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </section>
        </div>
      }
    </div>
  `,
  styleUrl: './painel-aluno.scss',
})
export class PainelAluno implements OnInit {
  courses = signal<StudentCourse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed signals
  coursesInProgress = computed(() =>
    this.courses().filter(c => !c.completed && c.progress > 0)
  );

  coursesNotStarted = computed(() =>
    this.courses().filter(c => c.progress === 0)
  );

  coursesCompleted = computed(() =>
    this.courses().filter(c => c.completed)
  );

  constructor(
    private coursesService: CoursesService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    const userId = this.authService.userId();
    if (!userId) {
      this.error.set('Usuário não identificado');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.coursesService.getStudentCourses(userId).subscribe({
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

  goToCourse(courseId: number): void {
    this.router.navigate(['/cursos', courseId]);
  }
}
