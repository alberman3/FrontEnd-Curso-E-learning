import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AuthService } from '../../auth/services/auth-services';

@Component({
  selector: 'app-tela-inicial',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    NavbarComponent
  ],
  templateUrl: './tela-inicial.html',
  styleUrls: ['./tela-inicial.scss']
})
export class TelaInicial {
  private auth = inject(AuthService);

  isLoggedIn = computed(() => this.auth.isLoggedIn());
  isStudent = computed(() => this.auth.isStudent());
  isInstructor = computed(() => this.auth.isInstructor());
}
