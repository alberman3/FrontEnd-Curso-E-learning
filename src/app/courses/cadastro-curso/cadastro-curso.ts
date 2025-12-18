import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    MatCheckboxModule,  // ← ADICIONADO - CRÍTICO!
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

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(150)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(20)
      ]],
      workload: [10, [
        Validators.required,
        Validators.min(10)
      ]],
      imageUrl: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      oldPrice: [0, [Validators.min(0)]],
      isBestSeller: [false],  // ← Valor booleano correto
      categoryIds: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    console.log('Iniciando cadastro-curso');
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.courseId = +params['id'];
        this.loadCourse();
      }
    });
  }

  loadCategories(): void {
    console.log('Carregando categorias...');

    this.coursesService.getCategories().subscribe({
      next: (data) => {
        console.log('Categorias recebidas:', data);
        this.categories.set(data);
      },
      error: (err) => {
        console.error('Erro ao carregar categorias:', err);
        this.snackBar.open('Erro ao carregar categorias', 'Fechar', { duration: 3000 });
      }
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
          isBestSeller: course.isBestSeller,
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
    console.log('Tentando enviar formulário...');
    console.log('Formulário válido?', this.form.valid);
    console.log('Erros do formulário:', this.getFormErrors());

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('Formulário inválido:', this.getFormErrors());
      this.snackBar.open('Preencha todos os campos obrigatórios corretamente', 'Fechar', {
        duration: 5000
      });
      return;
    }

    const instructorId = this.authService.userId();
    if (!instructorId) {
      this.snackBar.open('Instrutor não identificado', 'Fechar', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);

    // Payload alinhado com CourseRequestDTO
    const payload = {
      title: this.form.value.title,
      description: this.form.value.description,
      workload: this.form.value.workload,
      imageUrl: this.form.value.imageUrl,
      price: this.form.value.price,
      oldPrice: this.form.value.oldPrice || 0,  // ← Garantir valor numérico
      isBestSeller: this.form.value.isBestSeller,
      categoryIds: this.form.value.categoryIds,
      instructorIds: [instructorId]
    };

    console.log('Enviando payload:', payload);

    const request = this.isEditMode && this.courseId
      ? this.coursesService.update(this.courseId, payload)
      : this.coursesService.create(payload);

    request.subscribe({
      next: (course) => {
        console.log('Curso salvo com sucesso:', course);
        this.snackBar.open(
          this.isEditMode ? 'Curso atualizado!' : 'Curso criado!',
          'OK',
          { duration: 2000 }
        );
        this.router.navigate(['/instrutor']);
      },
      error: (err) => {
        console.error('Erro completo:', err);

        let errorMessage = 'Erro ao salvar curso';

        if (err.status === 400 && err.error?.message) {
          errorMessage = this.parseBackendValidationError(err.error.message);
        } else if (err.status === 409) {
          errorMessage = 'Já existe um curso com este título';
        } else if (err.status === 401) {
          errorMessage = 'Você precisa estar logado como instrutor';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        console.error('Mensagem de erro:', errorMessage);
        this.snackBar.open(errorMessage, 'Fechar', { duration: 5000 });
        this.isLoading.set(false);
      }
    });
  }

  private parseBackendValidationError(message: string): string {
    const validationMessages: string[] = [];
    const pattern = /\[Field '([^']+)': ([^\]]+)\]/g;
    let match;

    while ((match = pattern.exec(message)) !== null) {
      const fieldName = this.translateFieldName(match[1]);
      const errorMsg = match[2];
      validationMessages.push(`${fieldName}: ${errorMsg}`);
    }

    if (validationMessages.length > 0) {
      return validationMessages.join('\n');
    }

    return 'Dados inválidos. Verifique os campos do formulário.';
  }

  private translateFieldName(field: string): string {
    const translations: Record<string, string> = {
      'title': 'Título',
      'description': 'Descrição',
      'workload': 'Carga Horária',
      'imageUrl': 'URL da Imagem',
      'price': 'Preço',
      'categoryIds': 'Categorias',
      'instructorIds': 'Instrutores'
    };
    return translations[field] || field;
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  cancel(): void {
    this.router.navigate(['/instrutor']);
  }
}
