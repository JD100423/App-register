import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { AuthService } from "../../services/auth";

@Component({
    standalone: true,
    selector: 'app-root',
    templateUrl: './home.html',
    styleUrl: './home.css',
    imports: [ CommonModule ]
})

export class HomeComponent {
    private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  goRegisterEntrance() {
    this.router.navigate(['/entrance'])
  }
}