import { Routes } from '@angular/router';
import { RegisterEntranceComponent } from './pages/register-entrance/register-entrance';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterLoginComponent } from './pages/register-login/register-login';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'register', component: RegisterLoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'entrance', component: RegisterEntranceComponent },
    { path: 'exit', component: RegisterEntranceComponent }
];
