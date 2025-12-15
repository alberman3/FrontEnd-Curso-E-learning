import { Component, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/services/auth-services';
import { PainelCursos } from '../painel-cursos/painel-cursos';

@Component({
  selector: 'app-tela-inicial',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, PainelCursos],
  template: `
    <div class="home-container">
      <div class="hero">
        <h1>Plataforma E-learning</h1>
        <p>Aprenda, ensine e acompanhe seu progresso em um só lugar.</p>
      </div>

      @if (!isLoggedIn()) {
        <div class="cards-container">
          <div class="card">
            <h2>Já tem uma conta?</h2>
            <p>Acesse sua área para continuar seus cursos.</p>
            <button mat-raised-button color="primary" routerLink="/login">Login</button>
          </div>

          <div class="card">
            <h2>Novo por aqui?</h2>
            <p>Cadastre-se como aluno ou instrutor.</p>
            <button mat-raised-button color="accent" routerLink="/cadastro">Cadastre-se</button>
          </div>
        </div>
      }

      @if (isLoggedIn()) {
        <div class="logged-panel">
          <div class="user-actions">
            @if (isInstructor()) {
              <button mat-raised-button color="primary" routerLink="/instrutor">
                Painel Instrutor
              </button>
            }
            @if (isStudent()) {
              <button mat-raised-button color="primary" routerLink="/aluno">
                Painel Aluno
              </button>
            }
            <button mat-raised-button color="warn" (click)="logout()">Sair</button>
          </div>

          <app-painel-cursos></app-painel-cursos>
        </div>
      }

      <footer class="footer">© Plataforma E-learning</footer>
    </div>
  `,
  styleUrl: './tela-inicial.scss',
})
export class TelaInicial {
  constructor(private authService: AuthService, private router: Router) {}

  isLoggedIn = computed(() => this.authService.isLoggedIn());
  isInstructor = computed(() => this.authService.isInstructor());
  isStudent = computed(() => this.authService.isStudent());

  logout(): void {
    this.authService.logout();
  }
}
