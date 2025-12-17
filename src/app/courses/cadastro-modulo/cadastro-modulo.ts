import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CoursesService } from '../services/courses-services';

@Component({
  selector: 'app-cadastro-modulo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cadastro-modulo.html',
  styleUrl: './cadastro-modulo.scss',
})
export class CadastroModulo implements OnInit {
  form: FormGroup;
  isLoading = signal(false);
  courseId!: number;
  courseName = signal('');
  moduleOrder = signal(1);

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      order: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['courseId']) {
        this.courseId = +params['courseId'];
        this.loadCourse();
        this.loadModuleOrder();
      } else {
        this.snackBar.open('ID do curso não encontrado', 'Fechar', { duration: 3000 });
        this.router.navigate(['/instrutor']);
      }
    });
  }

  loadCourse(): void {
    this.coursesService.getById(this.courseId).subscribe({
      next: (course) => {
        this.courseName.set(course.title);
      },
      error: (err) => {
        console.error('Erro ao carregar curso:', err);
        this.snackBar.open('Erro ao carregar curso', 'Fechar', { duration: 3000 });
      }
    });
  }

  loadModuleOrder(): void {
    this.coursesService.getModulesByCourse(this.courseId).subscribe({
      next: (modules) => {
        const nextOrder = modules.length + 1;
        this.moduleOrder.set(nextOrder);
        this.form.patchValue({ order: nextOrder });
      },
      error: (err) => console.error('Erro ao carregar módulos:', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const payload = {
  title: this.form.value.title,
  description: this.form.value.description,
  order: this.form.value.order
};

this.coursesService
  .createModule(this.courseId, payload)
  .subscribe({
    next: () => {
      this.snackBar.open('Módulo criado com sucesso!', 'OK', { duration: 2000 });
      this.router.navigate(['/instrutor']);
    },
    error: (err) => {
      console.error('Erro ao criar módulo:', err);
      this.snackBar.open('Erro ao criar módulo', 'Fechar', { duration: 3000 });
      this.isLoading.set(false);
    }
  });
  }

  cancel(): void {
    this.router.navigate(['/instrutor']);
  }
}
