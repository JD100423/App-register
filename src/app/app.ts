import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth';
import { AlertService } from './services/alert';


@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [CommonModule, NgIf, RouterLink, RouterOutlet]
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  goRegisterEntrance() {
    this.router.navigate(['/entrance'])
  }
  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  get userName() {
    return this.auth.getCurrentUser()?.name ?? "";
  }

  async logout() {

    await this.alert.info('Cierre de sesión', 'Has cerrado sesión correctamente');
    this.auth.logout();
  }
}
