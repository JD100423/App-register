import { inject, Injectable } from "@angular/core";
import { FormEntrance } from "../interface/formEntrance";
import { AuthService } from "./auth";

const REGISTERS_KEY = 'registers_list';

@Injectable({
    providedIn: 'root',
})
export class RegisterService {
    private readonly auth = inject(AuthService);

    private isLocalStorageAvaliable(): boolean {
        try {
            return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
        } catch {
            return false;
        }
    }

    async saveAll(register: FormEntrance[]): Promise<void> {
        // Intenta enviar al backend; si falla, guarda en localStorage
        try {
            const resp = await fetch('/api/registers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(register),
            });
            if (resp.ok) return;
        } catch {
            // ignore network errors and fall back to localStorage
        }

        /*
        if (!this.isLocalStorageAvaliable()) return;
        try {
            localStorage.setItem(REGISTERS_KEY, JSON.stringify(register));
        } catch {
            // ignore write errors
        }
        */
    }
}