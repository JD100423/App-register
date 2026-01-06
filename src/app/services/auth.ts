import { inject, Injectable } from "@angular/core";
import { User } from "../interface/user";
import { Router } from "@angular/router";

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';
@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private router = inject(Router);
    private isLocalStorageAvaliable(): boolean {
        try {
            return typeof window !== 'undefined' && 
            typeof window.localStorage !== 'undefined';
        } catch {
            return false;
        }
    }

    private getAllUsers(): User[] {
        if (!this.isLocalStorageAvaliable()) return [];
        try {
            const raw = localStorage.getItem('users');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return[];
        }
    }

    private saveAllUsers(users: User[]): void {
        if (!this.isLocalStorageAvaliable()) return;
        try{
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } catch {
            // silence
        }
    }

    logout() {
        if (this.isLocalStorageAvaliable()) {
            try {
                localStorage.removeItem(CURRENT_USER_KEY);
            } catch {
                // silence
            }
        }
        this.router.navigate(['']);
    }

    register(user: Omit<User, 'id'>): boolean {
        if (!this.isLocalStorageAvaliable()) return false;
        const users = this.getAllUsers();
        if (users.find(u => u.email === user.email)) {
            return false;
        }

        const newUser : User = {
            ...user,
            id: crypto.randomUUID()
        };
        users.push(newUser);
        this.saveAllUsers(users);
        return true;
    }

    login(email: string, password: string): boolean {
        if (!this.isLocalStorageAvaliable()) return false;
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return false;
        }
        try {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        } catch {
            // ignore
        }
        return true;
    }

    getCurrentUser(): User | null {
        if (!this.isLocalStorageAvaliable()) return null;
        try {
            const raw = localStorage.getItem(CURRENT_USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    isLoggedIn(): boolean {
        return !!this.getCurrentUser();
    }
    
}