import { Component, ElementRef, ViewChild, PLATFORM_ID, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [CommonModule]
})
export class App {
  form: FormGroup | undefined;

  registerEntry(): void {
    const now = new Date();
    const fecha = now.toISOString().slice(0, 10);
    const hora = now.toTimeString().slice(0, 5);
    if (this.form && this.form.patchValue) {
      this.form.patchValue({ fecha, horaEntrada: hora });
    }
    const formEl = document.querySelector('.visitor-form') as HTMLFormElement | null;
    if (formEl) {
      window.scrollTo({ top: formEl.getBoundingClientRect().top + window.scrollY -20, behavior: 'smooth' });
    }
  }

  registerExit(): void {
    const now = new Date();
    const fecha = now.toISOString().slice(0, 10);
    const hora = now.toTimeString().slice(0, 5);
    if (this.form && this.form.patchValue) {
      this.form.patchValue({ fecha, horaSalida: hora });
    }
    const formEl = document.querySelector('.visitor-form') as HTMLFormElement | null;
    if (formEl) {
      window.scrollTo({ top: formEl.getBoundingClientRect().top + window.scrollY -20, behavior: 'smooth' });
    }
    console.log('Registrar Salida:', fecha, hora);
  }
}
