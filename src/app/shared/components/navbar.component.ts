import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider'; // ADICIONADO
import { AuthService } from '../../auth/services/auth-services';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatDividerModule // ADICIONADO
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="navbar-content">
        <!-- Logo/Brand -->
        <div class="brand" (click)="goToHome()">
          <mat-icon>school</mat-icon>
          <span>E-learning</span>
        </div>

        <!-- Navigation Links -->
        <div class="nav-links">
          @if (!authService.isLoggedIn()) {
            <!-- Usuário NÃO logado -->
            <button mat-button routerLink="/cursos">
              <mat-icon>library_books</mat-icon>
              <span>Cursos</span>
            </button>
            <button mat-button routerLink="/login">
              <mat-icon>login</mat-icon>
              <span>Entrar</span>
            </button>
            <button mat-raised-button color="accent" routerLink="/cadastro">
              <mat-icon>person_add</mat-icon>
              <span>Cadastrar</span>
            </button>
          } @else {
            <!-- Usuário LOGADO -->
            <button mat-button routerLink="/cursos">
              <mat-icon>library_books</mat-icon>
              <span>Cursos</span>
            </button>

            <!-- Botão específico por role -->
            @if (authService.isStudent()) {
              <button mat-raised-button color="accent" routerLink="/aluno">
                <mat-icon>dashboard</mat-icon>
                <span>Meu Painel</span>
              </button>
            }

            @if (authService.isInstructor()) {
              <button mat-raised-button color="accent" routerLink="/instrutor">
                <mat-icon>dashboard</mat-icon>
                <span>Painel Instrutor</span>
              </button>
            }

            <!-- Menu do usuário -->
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
              <mat-icon>account_circle</mat-icon>
              <span class="user-name">{{ authService.userName() }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu">
              <div class="user-info">
                <strong>{{ authService.userName() }}</strong>
                <small>{{ authService.userRole() === 'ROLE_STUDENT' ? 'Aluno' : 'Instrutor' }}</small>
              </div>
              <mat-divider></mat-divider>

              @if (authService.isStudent()) {
                <button mat-menu-item routerLink="/aluno">
                  <mat-icon>dashboard</mat-icon>
                  <span>Meu Painel</span>
                </button>
              }

              @if (authService.isInstructor()) {
                <button mat-menu-item routerLink="/instrutor">
                  <mat-icon>dashboard</mat-icon>
                  <span>Painel Instrutor</span>
                </button>
                <button mat-menu-item routerLink="/cadastro-curso">
                  <mat-icon>add</mat-icon>
                  <span>Criar Curso</span>
                </button>
              }

              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Sair</span>
              </button>
            </mat-menu>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .navbar-content {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      transition: opacity 0.2s;
    }

    .brand:hover {
      opacity: 0.8;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .user-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-info strong {
      font-size: 14px;
      color: rgba(0,0,0,0.87);
    }

    .user-info small {
      font-size: 12px;
      color: rgba(0,0,0,0.6);
    }

    mat-divider {
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .brand span {
        display: none;
      }

      .nav-links button span:not(.mat-icon) {
        display: none;
      }

      .user-name {
        display: none;
      }

      .nav-links {
        gap: 4px;
      }
    }
  `]
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  goToHome(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
  }
}
