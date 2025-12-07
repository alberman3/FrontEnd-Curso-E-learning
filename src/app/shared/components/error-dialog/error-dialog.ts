import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogContent,
         MatDialogModule, MatDialogTitle } from '@angular/material/dialog';

@Component({
 selector: 'app-error-dialog',
 standalone: true,
 imports: [MatDialogModule, MatDialogTitle,
           MatDialogContent, MatButtonModule],
 templateUrl: './error-dialog.html',
 styleUrl: './error-dialog.scss'
})
// ⬇️ CORREÇÃO: Alinhando o nome da classe com o seletor (app-error-dialog)
export class ErrorDialogComponent {
 constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}
}
