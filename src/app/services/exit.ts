import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AlertService } from "./alert";
import { Observable } from "rxjs";

export type StoredVisitor = {
    fecha: string;
    horaEntrada: string;
    nombre: string;
    cedula: string;
    empresa: string;
    correo: string;
    area: string;
    servicio: string;
    carnetVisita: string;
    horaSalida: string;
    firmaDaraUrl: string;
    savedAt: string;
};

@Injectable({
    providedIn: 'root'
})
export class ExitService {
    private alert = new AlertService();
    constructor(private http: HttpClient) {}

    getVisitorFromStorage(cedula: string): StoredVisitor | null {
        try {
            const raw = localStorage.getItem('visitors') || '[]';
            const visitors = JSON.parse(raw);
            return visitors[cedula] || null;
        } catch {
            console.log('No se encontró visitante con esa cédula.');
            return null;
        }
    }

    saveExitForCedula(cedula: string, horaSalida: string): boolean {
        try {
            const raw = localStorage.getItem('visitors') || '{}';
            const visitors = JSON.parse(raw);
            if (!visitors[cedula]) return false;
            visitors[cedula].horaSalida = horaSalida;
            visitors[cedula].savedAt = new Date().toISOString();
            localStorage.setItem('visitors', JSON.stringify(visitors));
            return true;
        } catch {
            console.log('Error al guardar la salida del visitante.');
            return false;
        }
    }

    patchExit(cedula: string, horaSalida: string): Observable<any> {
        return this.http.patch('/api/visitors', {cedula, horaSalida});
    }
}