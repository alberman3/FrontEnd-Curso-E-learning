import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorDialogComponent } from '../shared/components/error-dialog/error-dialog';
import { CoursesRoutingModule } from './courses-routing-module';


@NgModule({
 declarations: [],
 imports: [
 CommonModule,
 CoursesRoutingModule,
 ErrorDialogComponent
 ]
})
export class CoursesModule { }
