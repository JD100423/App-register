import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../components/footer';
import { RouterLink } from "@angular/router";

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './login.html',
  styleUrl: './login.css',
  imports: [CommonModule, FooterComponent, RouterLink]
})

export class LoginComponent {

}