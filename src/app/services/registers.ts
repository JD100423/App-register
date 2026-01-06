import { inject, Injectable } from "@angular/core";
import { FormEntrance } from "../interface/formEntrance";
import { AuthService } from "./auth";

const REGISTERS_KEY = 'registers_list';

@Injectable({
    providedIn: 'root'
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

    saveAll(register: FormEntrance[]): void {
        if (!this.isLocalStorageAvaliable()) return;
        try {
            localStorage.setItem(REGISTERS_KEY, JSON.stringify(register));
        } catch {
            // Ignore write errors
        }
    }
}