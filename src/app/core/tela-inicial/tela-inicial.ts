import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AuthService } from '../../auth/services/auth-services';

@Component({
  selector: 'app-tela-inicial',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    NavbarComponent
  ],
  template: `
    <!-- Navbar -->
    <app-navbar></app-navbar>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Bem-vindo à Plataforma E-learning</h1>
        <p>Aprenda novas habilidades com os melhores instrutores</p>

        @if (!authService.isLoggedIn()) {
          <div class="hero-actions">
            <button mat-raised-button color="primary" routerLink="/cadastro">
              <mat-icon>person_add</mat-icon>
              Criar Conta Grátis
            </button>
            <button mat-stroked-button routerLink="/cursos">
              <mat-icon>explore</mat-icon>
              Explorar Cursos
            </button>
          </div>
        } @else {
          <div class="hero-actions">
            @if (authService.isStudent()) {
              <button mat-raised-button color="primary" routerLink="/aluno">
                <mat-icon>dashboard</mat-icon>
                Ir para Meu Painel
              </button>
            }
            @if (authService.isInstructor()) {
              <button mat-raised-button color="primary" routerLink="/instrutor">
                <mat-icon>dashboard</mat-icon>
                Ir para Painel Instrutor
              </button>
            }
            <button mat-stroked-button routerLink="/cursos">
              <mat-icon>explore</mat-icon>
              Explorar Cursos
            </button>
          </div>
        }
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2>Por que escolher nossa plataforma?</h2>
        <div class="features-grid">
          <mat-card class="feature-card">
            <mat-icon>school</mat-icon>
            <h3>Cursos de Qualidade</h3>
            <p>Aprenda com instrutores experientes e conteúdo atualizado</p>
          </mat-card>

          <mat-card class="feature-card">
            <mat-icon>schedule</mat-icon>
            <h3>Aprenda no Seu Ritmo</h3>
            <p>Acesse os cursos quando e onde quiser, sem pressa</p>
          </mat-card>

          <mat-card class="feature-card">
            <mat-icon>verified</mat-icon>
            <h3>Certificados</h3>
            <p>Receba certificados ao concluir seus cursos</p>
          </mat-card>

          <mat-card class="feature-card">
            <mat-icon>support_agent</mat-icon>
            <h3>Suporte Dedicado</h3>
            <p>Tire suas dúvidas com nossos instrutores</p>
          </mat-card>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    @if (!authService.isLoggedIn()) {
      <section class="cta">
        <div class="container">
          <h2>Comece sua jornada de aprendizado hoje!</h2>
          <p>Junte-se a milhares de alunos que já transformaram suas carreiras</p>
          <button mat-raised-button color="accent" routerLink="/cadastro">
            <mat-icon>rocket_launch</mat-icon>
            Começar Agora
          </button>
        </div>
      </section>
    }

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>© 2024 Plataforma E-learning. Todos os direitos reservados.</p>
      </div>
    </footer>
  `,
  styleUrl: './tela-inicial.scss'
})
export class TelaInicial {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}
}
