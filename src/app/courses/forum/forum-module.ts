import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForumRoutingModule } from './forum-routing-module';
import { Forum } from './forum';


@NgModule({
  declarations: [
    Forum
  ],
  imports: [
    CommonModule,
    ForumRoutingModule
  ]
})
export class ForumModule { }
