import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth-services';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    setTimeout(() => {
      this.isLoading = true;
      this.cdr.detectChanges();
    });

    const payload = {
      login: this.form.value.email,
      password: this.form.value.password
    };

    this.authService.login(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Login realizado com sucesso!', 'OK', {
          duration: 2000
        });

        // Redirecionar baseado no role do usuário
        this.redirectAfterLogin();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();

        let errorMessage = 'Erro ao fazer login. Tente novamente.';

        // Verificar se a mensagem do backend indica credenciais inválidas
        if (err.status === 401 ||
            (err.status === 500 && err.error?.message?.includes('senha inválida'))) {
          errorMessage = 'Email ou senha inválidos';
        } else if (err.status === 500) {
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

  private redirectAfterLogin(): void {
    // Redirecionar baseado no role do usuário
    if (this.authService.isStudent()) {
      this.router.navigate(['/aluno']);
    } else if (this.authService.isInstructor()) {
      this.router.navigate(['/instrutor']);
    } else {
      // Fallback para home se não tiver role definido
      this.router.navigate(['/']);
    }
  }

  goToCadastro(): void {
    this.router.navigate(['/cadastro']);
  }
}
