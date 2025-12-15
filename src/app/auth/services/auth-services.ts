import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  name: string;
  login: string;
  password: string;
  role: 'STUDENT' | 'INSTRUCTOR';
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE = '/auth';
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signals reativos
  isLoggedIn = signal(this.checkInitialAuth());
  userRole = signal<'STUDENT' | 'INSTRUCTOR' | null>(this.getUserRole());

  constructor(private http: HttpClient, private router: Router) {}

  private checkInitialAuth(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('token');
  }

  private getUserRole(): 'STUDENT' | 'INSTRUCTOR' | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('userRole') as 'STUDENT' | 'INSTRUCTOR' | null;
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/login`, payload)
      .pipe(
        tap(response => {
          if (this.isBrowser) {
            localStorage.setItem('token', response.token);
            // Decodificar role do token se necessário, ou salvar do backend
            // Por enquanto, vamos assumir que você vai adicionar role na resposta
          }
          this.isLoggedIn.set(true);
        }),
        catchError(error => {
          console.error('Erro no login:', error);
          return throwError(() => error);
        })
      );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_BASE}/register`, payload)
      .pipe(
        tap(response => {
          console.log('Cadastro realizado:', response);
        }),
        catchError(error => {
          console.error('Erro no cadastro:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    }
    this.isLoggedIn.set(false);
    this.userRole.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  // Método para verificar se usuário é instrutor
  isInstructor(): boolean {
    return this.userRole() === 'INSTRUCTOR';
  }

  // Método para verificar se usuário é aluno
  isStudent(): boolean {
    return this.userRole() === 'STUDENT';
  }
}
