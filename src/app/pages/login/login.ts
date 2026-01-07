import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../components/footer';
import { Router, RouterLink } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { AlertService } from '../../services/alert';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './login.html',
  styleUrl: './login.css',
  imports: [CommonModule, FooterComponent, ReactiveFormsModule, RouterLink]
})



export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  formLogin = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async onSubmit () {
    if (this.formLogin.invalid) return;

    const { email, password } = this.formLogin.value;

    const ok = this.auth.login(email!, password!);
    if (!ok) {
      this.alert.error('Credenciales inválidas', 'Verifique sus credenciales e intente de nuevo');
      return;
    }

    await this.alert.success('Inicio de sesión exitoso', '¡Bienvenido!');
    this.router.navigate(['/home']);
  }
}