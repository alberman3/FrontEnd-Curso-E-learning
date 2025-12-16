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
  role?: 'STUDENT' | 'INSTRUCTOR';
  userId?: number;
  name?: string;
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

interface JwtPayload {
  sub: string; // email/login
  role?: string;
  userId?: number;
  name?: string;
  exp: number;
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
  userId = signal<number | null>(this.getUserId());
  userName = signal<string | null>(this.getUserName());

  constructor(private http: HttpClient, private router: Router) {}

  private checkInitialAuth(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('token');
  }

  private getUserRole(): 'STUDENT' | 'INSTRUCTOR' | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('userRole') as 'STUDENT' | 'INSTRUCTOR' | null;
  }

  private getUserId(): number | null {
    if (!this.isBrowser) return null;
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
  }

  private getUserName(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('userName');
  }

  // Decodificar JWT
  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/login`, payload)
      .pipe(
        tap(response => {
          if (!this.isBrowser) return;

          // Salvar token
          localStorage.setItem('token', response.token);

          // Se o backend retornar os dados completos
          if (response.role && response.userId && response.name) {
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('userId', response.userId.toString());
            localStorage.setItem('userName', response.name);

            this.isLoggedIn.set(true);
            this.userRole.set(response.role);
            this.userId.set(response.userId);
            this.userName.set(response.name);
          } else {
            // Caso contrário, decodificar o JWT
            const decoded = this.decodeToken(response.token);

            if (decoded) {
              // Extrair role do token (ajuste conforme estrutura do seu JWT)
              const role = decoded.role?.toUpperCase() as 'STUDENT' | 'INSTRUCTOR' | undefined;
              const userId = decoded.userId;
              const name = decoded.name || decoded.sub; // usar email se não tiver nome

              if (role) {
                localStorage.setItem('userRole', role);
                this.userRole.set(role);
              }

              if (userId) {
                localStorage.setItem('userId', userId.toString());
                this.userId.set(userId);
              }

              if (name) {
                localStorage.setItem('userName', name);
                this.userName.set(name);
              }

              this.isLoggedIn.set(true);
            }
          }
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
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
    }
    this.isLoggedIn.set(false);
    this.userRole.set(null);
    this.userId.set(null);
    this.userName.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  isInstructor(): boolean {
    return this.userRole() === 'INSTRUCTOR';
  }

  isStudent(): boolean {
    return this.userRole() === 'STUDENT';
  }
}
