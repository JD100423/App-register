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

    async getVisitorFromStorage(cedula: string): Promise<StoredVisitor | null> {
        try {
            const resp = await fetch(`/api/visitors/${encodeURIComponent(cedula)}`);
            if (resp.ok) {
                const data = await resp.json();
                console.log('Visitante encontrado en backend:', data);
                return data;
            }
            console.log('Backend no encontró visitante, intentando localStorage');
            // Fallback a localStorage si el backend falla
            const raw = localStorage.getItem('visitors') || '{}';
            const visitors = JSON.parse(raw);
            return visitors[cedula] || null;
        } catch (error) {
            console.error('Error al buscar visitante:', error);
            return null;
        }
    }

    async saveExitForCedula(cedula: string, horaSalida: string): Promise<boolean> {
        try {
            console.log('Actualizando salida para cédula:', cedula, 'hora:', horaSalida);
            const resp = await fetch('/api/visitors', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cedula, horaSalida }),
            });
            
            if (resp.ok) {
                console.log('Salida actualizada exitosamente en backend');
                return true;
            }
            
            console.error('Backend falló al actualizar, usando localStorage');
            // Fallback a localStorage si el backend falla
            const raw = localStorage.getItem('visitors') || '{}';
            const visitors = JSON.parse(raw);
            if (!visitors[cedula]) return false;
            visitors[cedula].horaSalida = horaSalida;
            visitors[cedula].savedAt = new Date().toISOString();
            localStorage.setItem('visitors', JSON.stringify(visitors));
            return true;
        } catch (error) {
            console.error('Error al guardar la salida del visitante:', error);
            return false;
        }
    }

    patchExit(cedula: string, horaSalida: string): Observable<any> {
        return this.http.patch('/api/visitors', {cedula, horaSalida});
    }
}