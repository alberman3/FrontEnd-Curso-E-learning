import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CoursesService } from '../services/courses-services';
import { AuthService } from '../../auth/services/auth-services';

@Component({
  selector: 'app-cadastro-curso',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cadastro-curso.html',
  styleUrl: './cadastro-curso.scss',
})
export class CadastroCurso implements OnInit {
  form: FormGroup;
  isLoading = signal(false);
  isEditMode = false;
  courseId?: number;
  categories = signal<any[]>([]);
  instructors = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      workload: [0, [Validators.required, Validators.min(1)]],
      imageUrl: [''],
      price: [0, [Validators.min(0)]],
      oldPrice: [0, [Validators.min(0)]],
      categoryIds: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    // Verificar se está editando
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.courseId = +params['id'];
        this.loadCourse();
      }
    });
  }

  loadCategories(): void {
    this.coursesService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Erro ao carregar categorias:', err)
    });
  }

  loadCourse(): void {
    if (!this.courseId) return;

    this.isLoading.set(true);
    this.coursesService.getById(this.courseId).subscribe({
      next: (course) => {
        this.form.patchValue({
          title: course.title,
          description: course.description,
          workload: course.workload,
          imageUrl: course.imageUrl,
          price: course.price,
          oldPrice: course.oldPrice,
          categoryIds: course.categories.map(c => c.id)
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar curso:', err);
        this.snackBar.open('Erro ao carregar curso', 'Fechar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const instructorId = this.authService.userId();
    if (!instructorId) {
      this.snackBar.open('Instrutor não identificado', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);

    const payload = {
      ...this.form.value,
      instructorIds: [instructorId]
    };

    const request = this.isEditMode && this.courseId
      ? this.coursesService.update(this.courseId, payload)
      : this.coursesService.create(payload);

    request.subscribe({
      next: (course) => {
        this.snackBar.open(
          this.isEditMode ? 'Curso atualizado!' : 'Curso criado!',
          'OK',
          { duration: 2000 }
        );
        this.router.navigate(['/instrutor']);
      },
      error: (err) => {
        console.error('Erro ao salvar curso:', err);
        this.snackBar.open('Erro ao salvar curso', 'Fechar', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/instrutor']);
  }
}
