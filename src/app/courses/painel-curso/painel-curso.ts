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
  enrollment = signal<EnrollmentResponseDTO | null>(null);

  progress = signal(0);
  completedLessons = signal<Set<number>>(new Set());
  isDownloadingCertificate = signal(false);

  safeVideoUrl = computed(() => {
    const lesson = this.currentLesson();
    if (!lesson?.videoUrl) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      this.getEmbedUrl(lesson.videoUrl)
    );
  });

  canIssueCertificate = computed(() => {
    const enroll = this.enrollment();
    return enroll && this.coursesService.canIssueCertificate(enroll);
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
            this.loadCompletedLessons();
            const firstAccessibleLesson = this.findFirstAccessibleLesson();
            if (firstAccessibleLesson) {
              this.selectLesson(firstAccessibleLesson);
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
      next: (enrollmentData: EnrollmentResponseDTO | null) => {
        if (enrollmentData) {
          this.isEnrolled.set(true);
          this.enrollmentId.set(enrollmentData.id);
          this.enrollment.set(enrollmentData);
          this.progress.set(Math.round(enrollmentData.overallProgress * 100));
          this.loadCompletedLessons();
        }
        this.isLoading.set(false);
      },
      error: err => {
        console.error('Erro ao verificar matrícula:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadCompletedLessons(): void {
    const enroll = this.enrollment();
    if (!enroll || !enroll.completedLessons) return;

    const completed = new Set(
      enroll.completedLessons.map(cl => cl.lesson.id)
    );
    this.completedLessons.set(completed);
  }

  findFirstAccessibleLesson(): Aula | null {
    for (const mod of this.modules()) {
      for (const lesson of mod.lessons ?? []) {
        if (this.canAccessLesson(lesson)) {
          return lesson;
        }
      }
    }
    return null;
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
      next: (enrollmentData: EnrollmentResponseDTO) => {
        this.isEnrolled.set(true);
        this.enrollmentId.set(enrollmentData.id);
        this.enrollment.set(enrollmentData);

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
    event.source.checked = this.completedLessons().has(lesson.id);

    if (!event.checked || this.completedLessons().has(lesson.id)) {
      return;
    }

    const course = this.course();
    if (!course) return;

    const currentModule = this.modules().find(m => m.id === lesson.moduleId);
    if (!currentModule) return;

    this.coursesService.markLessonComplete(course.id, currentModule.id, lesson.id).subscribe({
      next: (response) => {
        const updated = new Set(this.completedLessons());
        updated.add(lesson.id);
        this.completedLessons.set(updated);

        this.progress.set(Math.round(response.overallProgress * 100));

        event.source.checked = true;

        this.snackBar.open('Aula concluída!', 'OK', { duration: 2000 });

        this.checkEnrollment(course.id);

        if (response.overallProgress >= 1.0) {
          this.snackBar.open(
            '🎉 Parabéns! Você concluiu o curso! Agora pode emitir seu certificado.',
            'Fechar',
            { duration: 5000 }
          );
        }
      },
      error: err => {
        console.error('Erro ao marcar aula:', err);
        event.source.checked = false;

        const errorMsg = err.error?.message || 'Erro ao concluir aula';
        this.snackBar.open(errorMsg, 'Fechar', { duration: 3000 });
      }
    });
  }

  canAccessLesson(lesson: Aula): boolean {
    if (!this.isEnrolled()) return false;

    const modules = this.modules();
    const currentModule = modules.find(m => m.id === lesson.moduleId);
    if (!currentModule) return false;

    if (currentModule.order === 1 && lesson.order === 1) return true;

    for (const mod of modules) {
      if (mod.order < currentModule.order) {
        const allCompleted = mod.lessons?.every(l => this.completedLessons().has(l.id)) ?? false;
        if (!allCompleted) {
          return false;
        }
      } else if (mod.order === currentModule.order) {
        const previous = mod.lessons?.filter(l => l.order < lesson.order) ?? [];
        const allPreviousCompleted = previous.every(l => this.completedLessons().has(l.id));
        if (!allPreviousCompleted) {
          return false;
        }
      }
    }
    return true;
  }

  downloadCertificate(): void {
    const enrollId = this.enrollmentId();
    if (!enrollId) {
      this.snackBar.open('Matrícula não encontrada', 'Fechar', { duration: 3000 });
      return;
    }

    if (!this.canIssueCertificate()) {
      this.snackBar.open('Complete o curso para emitir o certificado', 'Fechar', { duration: 3000 });
      return;
    }

    this.isDownloadingCertificate.set(true);

    this.coursesService.downloadCertificate(enrollId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado_curso_${this.course()?.id || 'desconhecido'}.pdf`;
        link.click();

        window.URL.revokeObjectURL(url);

        this.isDownloadingCertificate.set(false);
        this.snackBar.open('Certificado baixado com sucesso!', 'OK', { duration: 3000 });
      },
      error: err => {
        console.error('Erro ao baixar certificado:', err);
        this.isDownloadingCertificate.set(false);

        const errorMsg = err.error?.message || 'Erro ao baixar certificado';
        this.snackBar.open(errorMsg, 'Fechar', { duration: 3000 });
      }
    });
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

goToForum(): void {
  const course = this.course();
  if (!course) {
    return;
  }

  this.router.navigate(
    ['/cursos/forum'],
    { queryParams: { courseId: course.id } }
  );
}


goToReview(): void {
  const course = this.course();
  if (course) {
    this.router.navigate(['/avaliar-curso'], { queryParams: { courseId: course.id } });
  }
}
}
