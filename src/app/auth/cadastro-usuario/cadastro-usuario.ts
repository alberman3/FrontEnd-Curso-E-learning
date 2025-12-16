import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth-services';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cadastro-usuario.html',
  styleUrl: './cadastro-usuario.scss',
})
export class CadastroUsuario {
  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef // ADICIONADO para resolver NG0100
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ROLE_STUDENT', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Usar setTimeout para evitar o erro NG0100
    setTimeout(() => {
      this.isLoading = true;
      this.cdr.detectChanges();
    });

    const payload = {
      name: this.form.value.name,
      login: this.form.value.email,
      password: this.form.value.password,
      role: this.form.value.role
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Cadastro realizado com sucesso! Faça login.', 'OK', {
          duration: 3000
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges(); // FORÇAR detecção após erro

        let errorMessage = 'Erro ao fazer cadastro. Tente novamente.';

        if (err.status === 500) {
          errorMessage = 'Erro no servidor. Verifique se o backend está rodando.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
