import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PainelCursos } from '../core/painel-cursos/painel-cursos';
import { PainelCurso } from './painel-curso/painel-curso';
import { CadastroCurso } from './cadastro-curso/cadastro-curso';
import { CadastroModulo } from './cadastro-modulo/cadastro-modulo';
import { CadastroAula } from './cadastro-aula/cadastro-aula';
import { AvaliacaoCurso } from './avaliacao-curso/avaliacao-curso';
import { Forum } from './forum/forum';
import { ForumDetalhesComponent } from './forum/forum-detalhes/forum-detalhes';
import { PainelAluno } from '../aluno/painel-aluno/painel-aluno';
import { PainelInstrutor } from '../instrutor/painel-instrutor/painel-instrutor';
import { authGuard, studentGuard, instructorGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  // Lista de cursos
  { path: '', component: PainelCursos },

  // Painéis
  { path: 'aluno', component: PainelAluno, canActivate: [studentGuard] },
  { path: 'instrutor', component: PainelInstrutor, canActivate: [instructorGuard] },

  // Fórum (por curso ou global)
  { path: 'forum', component: Forum, canActivate: [authGuard] },
  { path: 'forum/:id', component: ForumDetalhesComponent, canActivate: [authGuard] },

  // Avaliação
  { path: 'avaliar-curso', component: AvaliacaoCurso, canActivate: [studentGuard] },

  // Curso específico
  { path: ':id', component: PainelCurso },

  // Cadastro (instrutor)
  { path: 'novo', component: CadastroCurso, canActivate: [instructorGuard] },
  { path: ':id/modulo/novo', component: CadastroModulo, canActivate: [instructorGuard] },
  { path: ':id/aula/nova', component: CadastroAula, canActivate: [instructorGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoursesRoutingModule {}
