import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [CommonModule, RouterOutlet]
})
export class App {
  private readonly router = inject(Router);

  goRegisterEntrance() {
    this.router.navigate(['/entrance'])
  }
}
