import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth";
import { AlertService } from "../../services/alert";
import { FooterComponent } from "../../components/footer";

@Component({
    standalone: true,
    selector: 'app-register-login',
    templateUrl: './register-login.html',
    styleUrl: './register-login.css',
    imports: [CommonModule, ɵInternalFormsSharedModule, RouterLink, ReactiveFormsModule, FooterComponent]
})

export class RegisterLoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly auth = inject(AuthService);
    private readonly alert = inject(AlertService);
    private readonly router = inject(Router);

    registerForm = this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]]
    });

    async onSubmit() {
        if (this.registerForm.valid) {
            const { name, email, password } = this.registerForm.value;

            const ok = this.auth.register({
                name: name!,
                email: email!,
                password: password!
            });

            if (ok) {
                this.alert.error('Correo ya registrado', 'Intenta iniciar sesión');
                return;
            }
            console.log('Usuario registrado:', { name, email });
            
            await this.alert.success('Usuario creado', 'Ya puedes iniciar sesión');
            this.router.navigate(['']);
        }
    }
}