import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ExitService, StoredVisitor } from "../../services/exit";
import { AlertService } from "../../services/alert";
import { ɵInternalFormsSharedModule } from "@angular/forms";
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from "../../components/footer";

@Component({
    standalone: true,
    selector: 'app-register-exit',
    templateUrl: './register-exit.html',
    styleUrl: './register-exit.css',
    imports: [CommonModule, ɵInternalFormsSharedModule, FormsModule, HttpClientModule, FooterComponent]
})
export class RegisterExitComponent {
    cedula = '';
    visitor: StoredVisitor | null = null;
    horaSalida = '';

    constructor(private visitors: ExitService, private router: Router, private alert: AlertService) {}

    searchVisitor(e? : Event) {
        e?.preventDefault();
        const ced = this.cedula.trim();
        if (!ced) {
            this.alert.error('Por favor ingrese una cédula válida.');
            return;
        }
        const found = this.visitors.getVisitorFromStorage(ced);
        if (!found) {
            this.alert.error('No se encontró ningún visitante con esa cédula.');
            this.visitor = null;
            return;
        }
        this.visitor = found;
        const now = new Date();
        const hh = now.getHours().toString().padStart(2, '0');
        const mm = now.getMinutes().toString().padStart(2, '0');
        this.horaSalida = `${hh}:${mm}`;
    }

    goHome() {
        this.router.navigate(['/home']);
    }

    registerExit(e: Event) {
        e.preventDefault();
        if(!this.visitor) return;
        if (!this.horaSalida) {
            this.alert.error('Por favor ingrese la hora de salida.');
            return;
        }
        this.visitors.patchExit(this.visitor.cedula, this.horaSalida).subscribe({
            next: () => {
                this.alert.success('Salida registrada con éxito.');
                this.router.navigate(['/home']);
            },
            error: () => {
                const ok = this.visitors.saveExitForCedula(this.visitor!.cedula, this.horaSalida);
                if (ok) {
                    this.alert.success('Salida registrada con éxito y guardada localmente.');
                    this.router.navigate(['/home']);
                } else {
                    this.alert.error('Error al registrar la salida. Por favor, intente de nuevo.');
                }
            }
        });
    }

    cancel() {
        this.visitor = null;
        this.cedula = '';
        this.horaSalida = '';
    }
}