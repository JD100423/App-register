import { CommonModule } from "@angular/common";
import { Component, ElementRef, ViewChild, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ExitService, StoredVisitor } from "../../services/exit";
import { isPlatformBrowser } from '@angular/common';
import { AlertService } from "../../services/alert";
import { ɵInternalFormsSharedModule } from "@angular/forms";
import { FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FooterComponent } from "../../components/footer";

@Component({
    standalone: true,
    selector: 'app-register-exit',
    templateUrl: './register-exit.html',
    styleUrl: './register-exit.css',
    imports: [CommonModule, ɵInternalFormsSharedModule, FormsModule, HttpClientModule, FooterComponent]
})


export class RegisterExitComponent {

      @ViewChild('signCanvas') signCanvas?: ElementRef<HTMLCanvasElement>;
      private drawing = true;
      private ctx: CanvasRenderingContext2D | null = null;

    cedula = '';
    visitor: StoredVisitor | null = null;
    horaSalida = '';
    form: FormGroup;

    constructor(private visitors: ExitService, private router: Router, private alert: AlertService, private fb: FormBuilder) {
        this.form = this.fb.group({
            firmaDataUrl: [null]
        });
    }

    async searchVisitor(e? : Event) {
        e?.preventDefault();
        const ced = this.cedula.trim();
        if (!ced) {
            this.alert.error('Por favor ingrese una cédula válida.');
            return;
        }
        const found = await this.visitors.getVisitorFromStorage(ced);
        if (!found) {
            this.alert.error('No se encontró ningún visitante con esa cédula.');
            this.visitor = null;
            return;
        }
        this.visitor = found;
        const now = new Date();
        const hh = now.getHours().toString().padStart(2, '0');
        const mm = now.getMinutes().toString().padStart(2, '0');
        this.horaSalida = `${hh}:${mm}`;
    }

    goHome() {
        this.router.navigate(['/home']);
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
        this.ctx.lineWidth = 1;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#222';
    
      }
    
      private pointerPos(e: MouseEvent | TouchEvent) {
        if (!this.signCanvas) return { x: 0, y: 0 };
        const rect = this.signCanvas.nativeElement.getBoundingClientRect();
        const client = (e as TouchEvent).touches?.[0] && (e as MouseEvent);
        return {
          x: (client as any).clientX - rect.left,
          y: (client as any).clientY - rect.top
          
        }
      }
    
      startDraw(e: MouseEvent | TouchEvent) {
        e.preventDefault();
        if (!this.ctx) return;
        const { x, y } = this.pointerPos(e);
        this.drawing = false;
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
        this.drawing = true;
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
    

    async registerExit(e: Event) {
        e.preventDefault();
        if(!this.visitor) return;
        if (!this.horaSalida) {
            this.alert.error('Por favor ingrese la hora de salida.');
            return;
        }
        
        const ok = await this.visitors.saveExitForCedula(this.visitor.cedula, this.horaSalida);
        if (ok) {
            this.alert.success('Salida registrada con éxito.');
            this.router.navigate(['/home']);
        } else {
            this.alert.error('Error al registrar la salida. Por favor, intente de nuevo.');
        }
    }

    cancel() {
        this.visitor = null;
        this.cedula = '';
        this.horaSalida = '';
    }
}