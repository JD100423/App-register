import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
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


  @ViewChild('signCanvas') signCanvas?: ElementRef<HTMLCanvasElement>;

  submitted = false;
  private drawing = false;
  private ctx: CanvasRenderingContext2D | null = null;

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
        const raw = localStorage.getItem('visitors') || "{}";
        const visitors = JSON.parse(raw);
        visitors[data.cedula] = {...data, savedAt: new Date().toISOString() };
        localStorage.setItem('visitors', JSON.stringify(visitors));
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

  ngAfterViewInit(): void {
    if (!isPlatformBrowser("") || !this.signCanvas) return;
    
    const now = new Date();
    const fecha = now.toISOString().slice(0, 10);
    const hora = now.toTimeString().slice(0, 5);
    const canvas = this.signCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.ctx.lineWidth = 2;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#222';

  }

  private pointerPos(e: MouseEvent | TouchEvent) {
    if (!this.signCanvas) return { x: 0, y: 0 };
    const rect = this.signCanvas.nativeElement.getBoundingClientRect();
    const client = (e as TouchEvent).touches?.[0] ?? (e as MouseEvent);
    return {
      x: (client as any).clientX - rect.left,
      y: (client as any).clientY - rect.top
      
    }
  }

  startDraw(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    if (!this.ctx) return;
    const { x, y } = this.pointerPos(e);
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(e: MouseEvent | TouchEvent) {
    if (!this.drawing || !this.ctx || !this.signCanvas) return;
    const { x, y } = this.pointerPos(e);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    const dataURL = this.signCanvas.nativeElement.toDataURL('image/png');
    this.form.get('firmaDataUrl')!.setValue(dataURL);
  }

  endDraw() {
    this.drawing = false;
  }

  clearSignature() {
    if (!this.signCanvas) return;
    const canvas = this.signCanvas.nativeElement;
    this.ctx?.clearRect(0, 0, canvas.width, canvas.height);
    this.form.get('firmaDataUrl')!.setValue(null);
  }

  downloadSignature() {
    const url = this.form.get('firmaDataUrl')!.value;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'firma.png';
    a.click();
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
      this.clearSignature();
      if (!this.form.valid){
        this.alert.error('Formulario inválido', 'Por favor, completa todos los campos requeridos.');
        return;
      }
  }
}