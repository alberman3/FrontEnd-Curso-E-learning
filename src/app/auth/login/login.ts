import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  form: FormGroup;

  private readonly API_URL = '/auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    // 🔴 AJUSTE AQUI
    const payload = {
      login: this.form.value.email, // backend espera "login"
      password: this.form.value.password
    };

    this.http.post<{ token: string }>(
      this.API_URL,
      payload
    ).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        alert('Login realizado com sucesso!');
        this.form.reset();
      },
      error: (err) => {
        console.error(err);
        alert('Email ou senha inválidos');
      }
    });
  }
}
