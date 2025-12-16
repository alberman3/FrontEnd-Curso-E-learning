import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PainelCursos } from '../core/painel-cursos/painel-cursos';
import { PainelCurso} from './painel-curso/painel-curso';
import { CadastroCurso } from './cadastro-curso/cadastro-curso';
import { CadastroModulo} from './cadastro-modulo/cadastro-modulo';
import { CadastroAula} from './cadastro-aula/cadastro-aula';
import { AvaliacaoCurso} from './avaliacao-curso/avaliacao-curso';
import { Forum } from './forum/forum';
import { PainelAluno } from '../aluno/painel-aluno/painel-aluno';
import { PainelInstrutor } from '../instrutor/painel-instrutor/painel-instrutor';

const routes: Routes = [

  // Lista de cursos
  { path: '', component: PainelCursos},
  { path: 'forum', component: Forum },
  { path: 'aluno', component: PainelAluno},
  { path: 'instrutor', component: PainelInstrutor},
  { path: 'avaliar-cursos', component: AvaliacaoCurso},


  // Curso específico
  { path: ':id', component: PainelCurso},

  // Cadastro (instrutor)
  { path: 'novo', component: CadastroCurso},
  { path: ':id/modulo/novo', component: CadastroModulo},
  { path: ':id/aula/nova', component: CadastroAula},

  // Avaliação (aluno)
  { path: ':id/avaliacao', component: AvaliacaoCurso},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoursesRoutingModule {}
