import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
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
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="navbar">
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
            <button mat-button routerLink="/cursos" class="nav-btn">
              <mat-icon>library_books</mat-icon>
              <span>Cursos</span>
            </button>
            <button mat-button routerLink="/login" class="nav-btn">
              <mat-icon>login</mat-icon>
              <span>Entrar</span>
            </button>
            <button mat-raised-button color="accent" routerLink="/cadastro" class="signup-btn">
              <mat-icon>person_add</mat-icon>
              <span>Cadastrar</span>
            </button>
          } @else {
            <!-- Usuário LOGADO -->
            <button mat-button routerLink="/cursos" class="nav-btn">
              <mat-icon>library_books</mat-icon>
              <span>Cursos</span>
            </button>

            <!-- Menu do usuário -->
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
              <mat-icon class="user-avatar">account_circle</mat-icon>
              <span class="user-name">{{ authService.userName() }}</span>
              <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" class="user-menu">
              <div class="user-info">
                <div class="user-avatar-large">
                  <mat-icon>account_circle</mat-icon>
                </div>
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
                  <mat-icon>add_circle</mat-icon>
                  <span>Criar Curso</span>
                </button>
              }

              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()" class="logout-btn">
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      color: white;
      height: auto;
      min-height: 64px;
    }

    .navbar-content {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 22px;
      font-weight: 700;
      cursor: pointer;
      user-select: none;
      transition: all 0.3s ease;
      padding: 8px 12px;
      border-radius: 10px;
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: scale(1.02);
      }

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nav-btn {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
      transition: all 0.3s ease;
      border-radius: 8px;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }

      mat-icon {
        margin-right: 6px;
      }
    }

    .signup-btn {
      background: white;
      color: #667eea;
      font-weight: 700;
      border-radius: 10px;
      padding: 0 24px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.95);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      mat-icon {
        margin-right: 6px;
      }
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 6px 12px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .user-avatar {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .user-name {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dropdown-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    ::ng-deep .user-menu {
      margin-top: 8px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    .user-info {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);

      .user-avatar-large {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: white;
        }
      }

      strong {
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
      }

      small {
        font-size: 13px;
        color: #64748b;
        font-weight: 500;
      }
    }

    mat-divider {
      margin: 8px 0;
    }

    .logout-btn {
      color: #ef4444;

      mat-icon {
        color: #ef4444;
      }
    }

    @media (max-width: 768px) {
      .navbar-content {
        padding: 0 16px;
      }

      .brand span {
        display: none;
      }

      .nav-btn span:not(.user-name) {
        display: none;
      }

      .signup-btn span {
        display: none;
      }

      .user-name {
        display: none;
      }

      .nav-links {
        gap: 8px;
      }
    }

    @media (max-width: 480px) {
      .brand {
        font-size: 18px;
        padding: 6px 8px;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
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
