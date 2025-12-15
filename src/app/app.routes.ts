import { Routes } from '@angular/router';
import { Courses } from './courses/courses/courses';
import { Course } from './courses/model/course';
import { CadastroCurso } from './courses/cadastro-curso/cadastro-curso';
import { CadastroAula } from './courses/cadastro-aula/cadastro-aula';
import { CadastroModulo } from './courses/cadastro-modulo/cadastro-modulo';
import { Login } from './auth/login/login';
import { CadastroUsuario} from './auth/cadastro-usuario/cadastro-usuario';
import { TelaInicial } from './core/tela-inicial/tela-inicial';
import { PainelAluno } from './aluno/painel-aluno/painel-aluno';
import { PainelInstrutor } from './instrutor/painel-instrutor/painel-instrutor';
import { AvaliacaoCurso } from './courses/avaliacao-curso/avaliacao-curso';
import { PainelCurso } from './courses/painel-curso/painel-curso';


export const routes: Routes = [

  // Tela inicial
  { path: '', component: TelaInicial },

  // Autenticação
  { path: 'login', component: Login },
  { path: 'cadastro', component: CadastroUsuario },

  // Painéis principais
  { path: 'aluno', component: PainelAluno },
  { path: 'instrutor', component: PainelInstrutor },


   // Painéis de curso
  { path: 'cadastro-curso', component: CadastroCurso },
  { path: 'cadastro-aula', component: CadastroAula },
  { path: 'cadastro-modulo', component: CadastroModulo},
  { path: 'avaliar-curso', component: AvaliacaoCurso },
  { path: 'painel-curso', component: PainelCurso },

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
