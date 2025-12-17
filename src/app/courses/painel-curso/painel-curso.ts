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
import { CoursesService } from '../services/courses-services';
import { AuthService } from '../../auth/services/auth-services';
import { Course } from '../model/course';
import { Modulo } from '../model/modulo';
import { Aula } from '../model/aula';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

  canAccessLesson = (lesson: Aula): boolean => {
    const modules = this.modules();
    const currentModule = modules.find(m => m.id === lesson.moduleId);
    if (!currentModule) return false;

    // Primeiro módulo e primeira aula sempre liberados
    if (currentModule.order === 1 && lesson.order === 1) return true;

    // Se não estiver matriculado, não pode acessar
    if (!this.isEnrolled()) return false;

    // Verificar se todas as aulas anteriores estão completas
    for (const mod of modules) {
      if (mod.order < currentModule.order) {
        // Módulos anteriores devem estar completos
        const allLessonsComplete = mod.lessons?.every(l =>
          this.completedLessons().has(l.id)
        );
        if (!allLessonsComplete) return false;
      } else if (mod.order === currentModule.order) {
        // No módulo atual, verificar aulas anteriores
        const previousLessons = mod.lessons?.filter(l => l.order < lesson.order) || [];
        const allPreviousComplete = previousLessons.every(l =>
          this.completedLessons().has(l.id)
        );
        if (!allPreviousComplete) return false;
      }
    }

    return true;
  };

  constructor(
    private coursesService: CoursesService,
    public authService: AuthService, // MUDOU PARA PUBLIC
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.params['id'];
    if (courseId) {
      this.loadCourse(+courseId);
    }
  }

  loadCourse(courseId: number): void {
    this.isLoading.set(true);

    this.coursesService.getById(courseId).subscribe({
      next: (course) => {
        this.course.set(course);
        this.loadModules(courseId);
        this.checkEnrollment(courseId);
      },
      error: (err) => {
        console.error('Erro ao carregar curso:', err);
        this.snackBar.open('Erro ao carregar curso', 'Fechar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  loadModules(courseId: number): void {
    this.coursesService.getModulesByCourse(courseId).subscribe({
      next: (modules) => {
        // Carregar aulas de cada módulo
        const modulePromises = modules.map(mod =>
          this.coursesService.getLessonsByModule(mod.id).toPromise()
            .then(lessons => ({ ...mod, lessons: lessons || [] }))
        );

        Promise.all(modulePromises).then(modulesWithLessons => {
          this.modules.set(modulesWithLessons.sort((a, b) => a.order - b.order));

          // Selecionar primeira aula se estiver matriculado
          if (this.isEnrolled()) {
            const firstLesson = modulesWithLessons[0]?.lessons?.[0];
            if (firstLesson) {
              this.selectLesson(firstLesson);
            }
          }
        });
      },
      error: (err) => console.error('Erro ao carregar módulos:', err)
    });
  }

  checkEnrollment(courseId: number): void {
    const userId = this.authService.userId();
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.coursesService.getEnrollment(courseId, userId).subscribe({
      next: (enrollment) => {
        if (enrollment) {
          this.isEnrolled.set(true);
          this.enrollmentId.set(enrollment.id);
          this.loadProgress(enrollment.id);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao verificar matrícula:', err);
        this.isLoading.set(false);
      }
    });
  }

  loadProgress(enrollmentId: number): void {
    this.coursesService.getLessonProgress(enrollmentId).subscribe({
      next: (progressList) => {
        const completed = new Set(
          progressList.filter(p => p.completed).map(p => p.lessonId)
        );
        this.completedLessons.set(completed);
        this.calculateProgress();
      },
      error: (err) => console.error('Erro ao carregar progresso:', err)
    });
  }

  calculateProgress(): void {
    const allLessons = this.modules().flatMap(m => m.lessons || []);
    if (allLessons.length === 0) {
      this.progress.set(0);
      return;
    }
    const completed = allLessons.filter(l =>
      this.completedLessons().has(l.id)
    ).length;
    this.progress.set(Math.round((completed / allLessons.length) * 100));
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
      next: (enrollment) => {
        this.isEnrolled.set(true);
        this.enrollmentId.set(enrollment.id);
        this.snackBar.open('Matrícula realizada com sucesso!', 'OK', { duration: 2000 });

        // Selecionar primeira aula
        const firstLesson = this.modules()[0]?.lessons?.[0];
        if (firstLesson) {
          this.selectLesson(firstLesson);
        }
      },
      error: (err) => {
        console.error('Erro ao matricular:', err);
        this.snackBar.open('Erro ao realizar matrícula', 'Fechar', { duration: 3000 });
      }
    });
  }

  selectLesson(lesson: Aula): void {
    if (!this.canAccessLesson(lesson)) {
      this.snackBar.open(
        'Complete as aulas anteriores primeiro',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }
    this.currentLesson.set(lesson);
  }

  // CORRIGIDO: Agora aceita MatCheckboxChange
  toggleLessonComplete(lesson: Aula, event: MatCheckboxChange): void {
    const enrollId = this.enrollmentId();
    if (!enrollId) return;

    const isCompleted = this.completedLessons().has(lesson.id);

    if (!isCompleted && event.checked) {
      this.coursesService.markLessonComplete(enrollId, lesson.id).subscribe({
        next: () => {
          const updated = new Set(this.completedLessons());
          updated.add(lesson.id);
          this.completedLessons.set(updated);
          this.calculateProgress();
          this.snackBar.open('Aula marcada como concluída!', 'OK', { duration: 2000 });
        },
        error: (err) => {
          console.error('Erro ao marcar aula:', err);
          this.snackBar.open('Erro ao atualizar progresso', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  getEmbedUrl(url: string): string {
    // Converter URLs do YouTube para embed
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  }

  // NOVO MÉTODO: Calcular total de aulas
  getTotalLessons(): number {
    return this.modules().reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  }

  goBack(): void {
    this.router.navigate(['/cursos']);
  }
}
