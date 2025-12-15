import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './cadastro-usuario.html',
  styleUrl: './cadastro-usuario.scss',
})
export class CadastroUsuario {

  form: FormGroup;

  // IMPORTANTE: Barra no início da URL para o proxy funcionar
  private readonly API_URL = '/auth/register';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.value;

    // Transforma o payload para o formato esperado pelo backend
    const payload = {
      name: formValue.name,
      login: formValue.email,  // Backend espera "login", não "email"
      password: formValue.password,
      role: formValue.role
    };

    console.log('Enviando requisição para:', this.API_URL);
    console.log('Payload:', payload);

    this.http.post(this.API_URL, payload)
      .subscribe({
        next: (response: any) => {
          console.log('Resposta do servidor:', response);
          alert(response.message);
          this.form.reset();
        },
        error: (err) => {
          console.error('Erro completo:', err);
          console.error('Status:', err.status);
          console.error('Mensagem:', err.error);

          let mensagem = 'Erro ao cadastrar usuário';

          if (err.status === 400 && err.error?.message) {
            mensagem = 'Email já cadastrado ou dados inválidos!';
          } else if (err.status === 0) {
            mensagem = 'Erro de conexão com o servidor. Verifique se o backend está rodando.';
          }

          alert(mensagem);
        }
      });
  }
}
