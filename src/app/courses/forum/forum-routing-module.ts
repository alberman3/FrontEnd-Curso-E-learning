import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Forum } from './forum';

const routes: Routes = [{ path: '', component: Forum }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumRoutingModule { }
