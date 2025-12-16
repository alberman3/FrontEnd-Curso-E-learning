import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export type UserRole = 'ROLE_STUDENT' | 'ROLE_INSTRUCTOR';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role?: UserRole;
  userId?: number;
  name?: string;
}

export interface RegisterRequest {
  name: string;
  login: string;
  password: string;
  role: UserRole;
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

  isLoggedIn = signal(this.checkInitialAuth());
  userRole = signal<UserRole | null>(this.getUserRole());
  userId = signal<number | null>(this.getUserId());
  userName = signal<string | null>(this.getUserName());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private checkInitialAuth(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem('token');
  }

  private getUserRole(): UserRole | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('userRole') as UserRole | null;
  }

  private getUserId(): number | null {
    if (!this.isBrowser) return null;
    const id = localStorage.getItem('userId');
    return id ? Number(id) : null;
  }

  private getUserName(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('userName');
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/login`, payload)
      .pipe(
        tap(response => {
          if (!this.isBrowser) return;

          localStorage.setItem('token', response.token);

          if (response.role && response.userId && response.name) {
            localStorage.setItem('userRole', response.role);
            localStorage.setItem('userId', response.userId.toString());
            localStorage.setItem('userName', response.name);

            this.userRole.set(response.role);
            this.userId.set(response.userId);
            this.userName.set(response.name);
            this.isLoggedIn.set(true);
          }
        }),
        catchError(error => throwError(() => error))
      );
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_BASE}/register`, payload);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.clear();
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

  isStudent(): boolean {
    return this.userRole() === 'ROLE_STUDENT';
  }

  isInstructor(): boolean {
    return this.userRole() === 'ROLE_INSTRUCTOR';
  }
}
