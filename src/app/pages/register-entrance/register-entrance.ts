import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from "../../components/footer";
import { AlertService } from '../../services/alert';
import { RegisterService } from '../../services/registers';
import { FormEntrance } from '../../interface/formEntrance';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './register-entrance.html',
  styleUrl: './register-entrance.css',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FooterComponent]
})
export class RegisterEntranceComponent {
  private readonly fb = inject(FormBuilder);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router)
  private readonly registerService = inject(RegisterService);




  submitted = false;


  private today = new Date().toISOString().slice(0, 10);
  private now = new Date().toTimeString().slice(0, 5);

    form = this.fb.group({
      fecha: [this.today, Validators.required],
      horaEntrada: [this.now, Validators.required],
      nombre: ['', Validators.required],
      cedula: ['', Validators.required],
      empresa: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      area: ['', Validators.required],
      motivo: ['', Validators.required],
      carnetVisita: [false],
      horaSalida: [''],
      firmaDataUrl: [null as string | null]
    });

    saveVisitorToStorage(data: FormEntrance) {
      try {
        /*
        const raw = localStorage.getItem('visitors') || "{}";
        const visitors = JSON.parse(raw);
        visitors[data.cedula] = {...data, savedAt: new Date().toISOString() };
        localStorage.setItem('visitors', JSON.stringify(visitors));
        */
        this.registerService.saveAll([data]);
      } catch (err) {
        console.error('Error saving visitor to storage', err);
      }
    }

    async postVisitorData (data: FormEntrance) {
      try {
        const res = await fetch('/api/visitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }
        return res.json();
      } catch (err) {
        throw err;
      }
    }

  
  error(key: string): string | null {
    const c = this.form.get(key);
    if (!c) return null;
    if (!(c.invalid && (c.touched || this.submitted))) return null;

    if (c.errors?.['required']) {
      switch (key) {
        case 'nombre': return 'Nombre es requerido.';
        case 'cedula': return 'Cédula es requerida.';
        case 'empresa': return 'Empresa es requerida.';
        case 'correo': return 'Correo es requerido.';
        case 'area': return 'Área es requerida.';
        case 'motivo': return 'Motivo es requerido.';
        case 'firmaDataUrl': return 'Firma es requerida.';
      }
    }
    if (c.errors?.['email']) return 'Correo no es válido.';
    return null;
  }

  onSubmit() {
    if (this.form.valid) {
      const formData: FormEntrance = this.form.value as FormEntrance;
      this.saveVisitorToStorage(formData);(() => {
        this.alert.success('Visita registrada', 'Los datos de la visita han sido guardados correctamente.');
        this.router.navigate(['/home']);
      })();
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
      const now = new Date().toTimeString().slice(0, 5);
      this.form.reset({
      fecha: today,
      horaEntrada: now,
      nombre: '',
      cedula: '',
      empresa: '',
      correo: '',
      area: '',
      motivo: '',
      carnetVisita: false,
      horaSalida: '',
      firmaDataUrl: null
      });
      this.submitted = false;
      if (!this.form.valid){
        this.alert.error('Formulario inválido', 'Por favor, completa todos los campos requeridos.');
        return;
      }
  }
}