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
import { Modulo } from '../model/modulo';
import { CreateLessonRequest } from '../services/courses-services';


@Component({
  selector: 'app-cadastro-aula',
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
  templateUrl: './cadastro-aula.html',
  styleUrl: './cadastro-aula.scss',
})
export class CadastroAula implements OnInit {
  form: FormGroup;
  isLoading = signal(false);
  courseId!: number;
  modules = signal<Modulo[]>([]);

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      videoUrl: [''],
      moduleId: [null, Validators.required],
      order: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['courseId']) {
        this.courseId = +params['courseId'];
        this.loadModules();
      } else {
        this.snackBar.open('ID do curso não encontrado', 'Fechar', { duration: 3000 });
        this.router.navigate(['/instrutor']);
      }
    });

    this.form.get('moduleId')?.valueChanges.subscribe(moduleId => {
      if (moduleId) {
        this.loadLessonOrder(moduleId);
      }
    });
  }

  loadModules(): void {
    this.coursesService.getModulesByCourse(this.courseId).subscribe({
      next: modules => this.modules.set(modules),
      error: err => {
        console.error(err);
        this.snackBar.open('Erro ao carregar módulos', 'Fechar', { duration: 3000 });
      }
    });
  }

  // ✅ CORRETO: só calcula ordem
  loadLessonOrder(moduleId: number): void {
    this.coursesService
  .getLessonsByModule(this.courseId, moduleId)
  .subscribe({
    next: (lessons) => {
      const nextOrder = lessons.length + 1;
      this.form.patchValue({ order: nextOrder });
    },
    error: (err) => console.error('Erro ao carregar aulas:', err)
  });
  }

  // ✅ CORRETO: cria aula
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const moduleId = this.form.value.moduleId;

    const lessonPayload: CreateLessonRequest = {
      title: this.form.value.title,
      content: this.form.value.content,
      videoUrl: this.form.value.videoUrl,
      order: this.form.value.order,
      moduleId: moduleId
    };

    this.coursesService
      .createLesson(this.courseId, moduleId, lessonPayload)
      .subscribe({
        next: () => {
          this.snackBar.open('Aula criada com sucesso!', 'OK', { duration: 2000 });
          this.router.navigate(['/instrutor']);
        },
        error: err => {
          console.error(err);
          this.snackBar.open('Erro ao criar aula', 'Fechar', { duration: 3000 });
          this.isLoading.set(false);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/instrutor']);
  }
}
