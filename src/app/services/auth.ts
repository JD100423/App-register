import { Injectable } from "@angular/core";
import { User } from "../interface/user";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})

export class AuthService {
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
            localStorage.setItem('users', JSON.stringify(users));
        } catch {
            // ignore
        }
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
    
}