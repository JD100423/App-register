import { Routes } from '@angular/router';
import { RegisterEntranceComponent } from './pages/register-entrance/register-entrance';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterLoginComponent } from './pages/register-login/register-login';
import { CanActivateAuthGuard } from './guards/auth';
import { RegisterExitComponent } from './pages/register-exit/register-exit';
import { ForgotPasswordComponent } from './pages/password-recovery/password-recovery';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, },
    { path: 'register', component: RegisterLoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [CanActivateAuthGuard] },
    { path: 'entrance', component: RegisterEntranceComponent , canActivate: [CanActivateAuthGuard] },
    { path: 'exit', component: RegisterExitComponent, canActivate: [CanActivateAuthGuard] },
    { path: 'forgot', component: ForgotPasswordComponent },
    { path: '**', redirectTo: '/login' }
];
