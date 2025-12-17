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
import { MatDividerModule } from '@angular/material/divider'; // ADICIONADO
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatDividerModule,
    MatSnackBarModule,
    NavbarComponent
  ],
  templateUrl: './painel-instrutor.html',
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
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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

  addLesson(courseId: number): void {
    this.router.navigate(['/cadastro-aula'], { queryParams: { courseId } });
  }

  viewCourse(courseId: number): void {
    this.router.navigate(['/cursos', courseId]);
  }

  deleteCourse(courseId: number): void {
    if (!confirm('Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.coursesService.delete(courseId).subscribe({
      next: () => {
        this.snackBar.open('Curso excluído com sucesso', 'OK', { duration: 2000 });
        this.loadCourses();
      },
      error: (err) => {
        console.error('Erro ao excluir curso:', err);
        this.snackBar.open('Erro ao excluir curso', 'Fechar', { duration: 3000 });
      }
    });
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

  // NOVO MÉTODO: Calcular total de aulas por curso
  getCourseLessonsCount(course: Course): number {
    if (!course.modules) return 0;
    return course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  }
}
