import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../services/alert';
import { RouterLink } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-forgot-password',
    templateUrl: './password-recovery.html',
    styleUrl: './password-recovery.css',
    imports: [CommonModule, ReactiveFormsModule, RouterLink]
})

export class ForgotPasswordComponent {
    private readonly fb = inject(FormBuilder);
    private readonly alert = inject(AlertService);

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    async onSubmit(){
        if (this.form.invalid) return;

        await this.alert.info(
            'Recuperación de contraseña',
            'Si el correo electrónico proporcionado está registrado, recibirás un enlace para restablecer tu contraseña.'
        );
    }
}