import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server
  },
  {
    path: 'login',
    renderMode: RenderMode.Server
  },
  {
    path: 'cadastro',
    renderMode: RenderMode.Server
  },
   {
    path: 'cadastro-curso',
    renderMode: RenderMode.Server
  },
   {
    path: 'cadastro-aula',
    renderMode: RenderMode.Server
  },
   {
    path: 'cadastro-modulo',
    renderMode: RenderMode.Server
  },
  {
    path: 'avaliar-curso',
    renderMode: RenderMode.Server
  },
  {
    path: 'cursos/**',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
