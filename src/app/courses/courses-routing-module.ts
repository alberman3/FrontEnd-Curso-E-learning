import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Importa o componente que será renderizado por esta rota.
import { Courses } from './courses/courses';


// Array de rotas. Define o mapeamento entre um caminho (URL) e um componente.
const routes: Routes = [
  {
    // Quando o path (caminho relativo) for vazio, este componente será carregado.
    // Exemplo: Se este módulo é carregado em '/cursos', o componente 'Courses' será exibido em '/cursos'.
    path : '',
    component : Courses
  }
];

/**
 * Módulo de roteamento específico para a funcionalidade de Cursos.
 * Geralmente é importado pelo módulo principal (CoursesModule) e configurado para Lazy Loading.
 */
@NgModule({
  /**
   * Importa o RouterModule e configura as rotas para um módulo 'child' (filho).
   * Isso garante que as rotas sejam registradas sem duplicar os provedores de roteamento.
   */
  imports: [RouterModule.forChild(routes)],

  /**
   * Exporta o RouterModule para que as diretivas de roteamento
   * (como routerLink, router-outlet) fiquem disponíveis
   * para os componentes que pertencem a este módulo.
   */
  exports: [RouterModule]
})
export class CoursesRoutingModule { }
