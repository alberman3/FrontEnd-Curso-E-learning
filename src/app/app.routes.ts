import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { CadastroUsuario } from './auth/cadastro-usuario/cadastro-usuario';
import { TelaInicial } from './core/tela-inicial/tela-inicial';
import { PainelAluno } from './aluno/painel-aluno/painel-aluno';
import { PainelInstrutor } from './instrutor/painel-instrutor/painel-instrutor';
import { authGuard, studentGuard, instructorGuard } from './auth/guards/auth.guard';
import { CadastroCurso } from './courses/cadastro-curso/cadastro-curso';
import { CadastroAula } from './courses/cadastro-aula/cadastro-aula';
import { CadastroModulo } from './courses/cadastro-modulo/cadastro-modulo';
import { AvaliacaoCurso } from './courses/avaliacao-curso/avaliacao-curso';
import { Forum } from './courses/forum/forum';


export const routes: Routes = [
  { path: '', component: TelaInicial },
  { path: 'login', component: Login },
  { path: 'cadastro', component: CadastroUsuario },

  { path: 'cadastro-curso', component: CadastroCurso, canActivate: [authGuard, instructorGuard] },
  { path: 'cadastro-aula', component: CadastroAula, canActivate: [authGuard, instructorGuard] },
  { path: 'cadastro-modulo', component: CadastroModulo, canActivate: [authGuard, instructorGuard] },

  {
    path: 'cursos',
    loadChildren: () => import('./courses/courses-module').then(m => m.CoursesModule)
  },{ path: 'forum', component: Forum },
  { path: 'aluno', component: PainelAluno, canActivate: [authGuard, studentGuard] },
  { path: 'instrutor', component: PainelInstrutor, canActivate: [authGuard, instructorGuard] },
  { path: 'avaliar-curso', component: AvaliacaoCurso, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
