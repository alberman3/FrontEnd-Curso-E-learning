import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

import { CoursesService } from '../services/courses-services';
import { AuthService } from '../../auth/services/auth-services';

import { Course } from '../model/course';
import { Modulo } from '../model/modulo';
import { Aula } from '../model/aula';
import { EnrollmentResponseDTO } from '../model/enrollment';

@Component({
  selector: 'app-painel-curso',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './painel-curso.html',
  styleUrl: './painel-curso.scss',
})
export class PainelCurso implements OnInit {

  course = signal<Course | null>(null);
  modules = signal<Modulo[]>([]);
  currentLesson = signal<Aula | null>(null);

  isLoading = signal(true);
  isEnrolled = signal(false);
  enrollmentId = signal<number | null>(null);

  progress = signal(0);
  completedLessons = signal<Set<number>>(new Set());

  safeVideoUrl = computed(() => {
    const lesson = this.currentLesson();
    if (!lesson?.videoUrl) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.getEmbedUrl(lesson.videoUrl)
    );
  });

  constructor(
    private coursesService: CoursesService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.params['id']);
    if (courseId) {
      this.loadCourse(courseId);
    }
  }

  loadCourse(courseId: number): void {
    this.isLoading.set(true);

    this.coursesService.getById(courseId).subscribe({
      next: course => {
        this.course.set(course);
        this.loadModules(courseId);
        this.checkEnrollment(courseId);
      },
      error: err => {
        console.error('Erro ao carregar curso:', err);
        this.snackBar.open('Erro ao carregar curso', 'Fechar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  loadModules(courseId: number): void {
    this.coursesService.getModulesByCourse(courseId).subscribe({
      next: modules => {
        const requests = modules.map(mod =>
          this.coursesService
            .getLessonsByModule(courseId, mod.id)
            .toPromise()
            .then(lessons => ({ ...mod, lessons: lessons ?? [] }))
        );

        Promise.all(requests).then(modulesWithLessons => {
          this.modules.set(
            modulesWithLessons.sort((a, b) => a.order - b.order)
          );

          if (this.isEnrolled()) {
            const firstLesson = modulesWithLessons[0]?.lessons?.[0];
            if (firstLesson) {
              this.selectLesson(firstLesson);
            }
          }
        });
      },
      error: err => console.error('Erro ao carregar módulos:', err)
    });
  }

  checkEnrollment(courseId: number): void {
    const userId = this.authService.userId();
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.coursesService.getEnrollment(courseId, userId).subscribe({
      next: (enrollment: EnrollmentResponseDTO | null) => {
        if (enrollment) {
          this.isEnrolled.set(true);
          this.enrollmentId.set(enrollment.id);
          this.loadProgress(enrollment.id);
        }
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Erro ao verificar matrícula:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadProgress(enrollmentId: number): void {
    this.coursesService.getLessonProgress(enrollmentId).subscribe({
      next: progressList => {
        const completed = new Set(
          progressList.filter(p => p.completed).map(p => p.lessonId)
        );
        this.completedLessons.set(completed);
        this.calculateProgress();
      },
      error: err => console.error('Erro ao carregar progresso:', err)
    });
  }

  calculateProgress(): void {
    const allLessons = this.modules().flatMap(m => m.lessons ?? []);
    if (!allLessons.length) {
      this.progress.set(0);
      return;
    }

    const completedCount = allLessons.filter(l =>
      this.completedLessons().has(l.id)
    ).length;

    this.progress.set(Math.round((completedCount / allLessons.length) * 100));
  }

  enroll(): void {
    const course = this.course();
    const userId = this.authService.userId();

    if (!course || !userId) {
      this.snackBar.open('Erro ao processar matrícula', 'Fechar', { duration: 3000 });
      return;
    }

    if (!this.authService.isStudent()) {
      this.snackBar.open('Apenas alunos podem se matricular', 'Fechar', { duration: 3000 });
      return;
    }

    this.coursesService.enroll(course.id, userId).subscribe({
      next: (enrollment: EnrollmentResponseDTO) => {
        this.isEnrolled.set(true);
        this.enrollmentId.set(enrollment.id);

        this.snackBar.open('Matrícula realizada com sucesso!', 'OK', { duration: 2000 });

        const firstLesson = this.modules()[0]?.lessons?.[0];
        if (firstLesson) {
          this.selectLesson(firstLesson);
        }
      },
      error: err => {
        console.error('Erro ao matricular:', err);
        this.snackBar.open('Erro ao realizar matrícula', 'Fechar', { duration: 3000 });
      }
    });
  }

  selectLesson(lesson: Aula): void {
    if (!this.canAccessLesson(lesson)) {
      this.snackBar.open('Complete as aulas anteriores primeiro', 'Fechar', { duration: 3000 });
      return;
    }
    this.currentLesson.set(lesson);
  }

  toggleLessonComplete(lesson: Aula, event: MatCheckboxChange): void {
    const enrollmentId = this.enrollmentId();
    if (!enrollmentId || !event.checked) return;

    if (!this.completedLessons().has(lesson.id)) {
      this.coursesService.markLessonComplete(enrollmentId, lesson.id).subscribe({
        next: () => {
          const updated = new Set(this.completedLessons());
          updated.add(lesson.id);
          this.completedLessons.set(updated);
          this.calculateProgress();
        },
        error: err => console.error('Erro ao marcar aula:', err)
      });
    }
  }

  canAccessLesson(lesson: Aula): boolean {
    const modules = this.modules();
    const currentModule = modules.find(m => m.id === lesson.moduleId);
    if (!currentModule) return false;

    if (currentModule.order === 1 && lesson.order === 1) return true;
    if (!this.isEnrolled()) return false;

    for (const mod of modules) {
      if (mod.order < currentModule.order) {
        if (!mod.lessons?.every(l => this.completedLessons().has(l.id))) {
          return false;
        }
      } else if (mod.order === currentModule.order) {
        const previous = mod.lessons?.filter(l => l.order < lesson.order) ?? [];
        if (!previous.every(l => this.completedLessons().has(l.id))) {
          return false;
        }
      }
    }
    return true;
  }

  getEmbedUrl(url: string): string {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  getTotalLessons(): number {
    return this.modules().reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0);
  }

  goBack(): void {
    this.router.navigate(['/cursos']);
  }
}
