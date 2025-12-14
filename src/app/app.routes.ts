import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { CadastroUsuario} from './auth/cadastro-usuario/cadastro-usuario';
import { TelaInicial } from './core/tela-inicial/tela-inicial';
import { PainelAluno } from './aluno/painel-aluno/painel-aluno';
import { PainelInstrutor } from './instrutor/painel-instrutor/painel-instrutor';

export const routes: Routes = [

  // Tela inicial
  { path: '', component: TelaInicial },

  // Autenticação
  { path: 'login', component: Login },
  { path: 'cadastro', component: CadastroUsuario },

  // Painéis principais
  { path: 'aluno', component: PainelAluno },
  { path: 'instrutor', component: PainelInstrutor },

  // Cursos (lazy loading)
  {
    path: 'cursos',
    loadChildren: () =>
      import('./courses/courses-module')
        .then(m => m.CoursesModule)
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
