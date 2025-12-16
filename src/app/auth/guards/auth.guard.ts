import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-services';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const studentGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isStudent()) {
    return true;
  }

  // Se estiver logado mas não for aluno, redireciona para home
  if (authService.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }

  // Se não estiver logado, redireciona para login
  router.navigate(['/login']);
  return false;
};

export const instructorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isInstructor()) {
    return true;
  }

  // Se estiver logado mas não for instrutor, redireciona para home
  if (authService.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }

  // Se não estiver logado, redireciona para login
  router.navigate(['/login']);
  return false;
};
