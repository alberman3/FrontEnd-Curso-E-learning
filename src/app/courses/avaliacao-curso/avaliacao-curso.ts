import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { ReviewService, ReviewResponse } from '../services/review.service';
import { CoursesService } from '../services/courses-services';
import { AuthService } from '../../auth/services/auth-services';
import { Course } from '../model/course';

@Component({
  selector: 'app-avaliacao-curso',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './avaliacao-curso.html',
  styleUrls: ['./avaliacao-curso.scss']
})
export class AvaliacaoCurso implements OnInit {
  course = signal<Course | null>(null);
  reviews = signal<ReviewResponse[]>([]);
  isLoading = signal(true);
  rating = signal(0);
  reviewForm: FormGroup;
  averageRating = signal(0);
  hasReviewed = signal(false);

  constructor(
    private reviewService: ReviewService,
    private coursesService: CoursesService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.reviewForm = this.fb.group({
      comment: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.queryParams['courseId']);

    if (!courseId) {
      this.snackBar.open('Curso não identificado', 'Fechar', { duration: 3000 });
      this.router.navigate(['/cursos']);
      return;
    }

    this.loadCourse(courseId);
    this.loadReviews(courseId);
  }

  loadCourse(courseId: number): void {
    this.coursesService.getById(courseId).subscribe({
      next: (data) => {
        this.course.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar curso:', err);
        this.snackBar.open('Erro ao carregar curso', 'Fechar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  loadReviews(courseId: number): void {
    this.reviewService.listReviewsByCourse(courseId).subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.calculateAverageRating();
        this.checkIfUserReviewed();
      },
      error: (err) => {
        console.error('Erro ao carregar avaliações:', err);
      }
    });
  }

  calculateAverageRating(): void {
    const avg = this.reviewService.calculateAverageRating(this.reviews());
    this.averageRating.set(Math.round(avg * 10) / 10);
  }

  getRoundedAverageRating(): number {
  return Math.round(this.averageRating());
}

  checkIfUserReviewed(): void {
    const userName = this.authService.userName();
    if (!userName) return;

    const userReview = this.reviews().find(r => r.studentName === userName);
    this.hasReviewed.set(!!userReview);
  }

  setRating(value: number): void {
    this.rating.set(value);
  }

  submitReview(): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Você precisa estar logado para avaliar', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isStudent()) {
      this.snackBar.open('Apenas alunos podem avaliar cursos', 'Fechar', { duration: 3000 });
      return;
    }

    if (this.rating() === 0) {
      this.snackBar.open('Selecione uma nota', 'Fechar', { duration: 3000 });
      return;
    }

    if (this.hasReviewed()) {
      this.snackBar.open('Você já avaliou este curso', 'Fechar', { duration: 3000 });
      return;
    }

    const course = this.course();
    if (!course) return;

    const request = {
      rating: this.rating(),
      comment: this.reviewForm.value.comment || undefined
    };

    this.reviewService.createReview(course.id, request).subscribe({
      next: () => {
        this.snackBar.open('Avaliação enviada com sucesso!', 'OK', { duration: 2000 });
        this.rating.set(0);
        this.reviewForm.reset();
        this.loadReviews(course.id);
      },
      error: (err) => {
        console.error('Erro ao enviar avaliação:', err);
        const errorMsg = err.error?.message || 'Erro ao enviar avaliação';
        this.snackBar.open(errorMsg, 'Fechar', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    const course = this.course();
    if (course) {
      this.router.navigate(['/cursos', course.id]);
    } else {
      this.router.navigate(['/cursos']);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }
}
