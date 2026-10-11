import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="shell">
      <header class="topbar">
        <a class="brand brand-link" routerLink="/home"><span class="brand-mark small">FT</span><strong>FoodTrace</strong></a>
        <div class="user-area">
          <span>{{ auth.session?.username }} · {{ auth.session?.rol }}</span>
          <button class="ghost-button" (click)="logout()">Cerrar sesión</button>
        </div>
      </header>
      <section class="welcome">
        <p class="eyebrow">PANEL PRINCIPAL</p>
        <h1>Hola, {{ auth.session?.username }}</h1>
        <p class="muted">Este es el inicio de tu plataforma de trazabilidad.</p>
      </section>
      <section class="quick-actions">
        <a class="dashboard-card accent" routerLink="/catalogos"><span>01</span><h2>Catálogos</h2><p>Administra materias primas, productos y proveedores.</p><b>Gestionar →</b></a>
        <a class="dashboard-card" routerLink="/trazabilidad"><span>02</span><h2>Trazabilidad</h2><p>Consulta el recorrido de lotes hacia atrás o adelante.</p><b>Consultar →</b></a>
        <article class="dashboard-card"><span>03</span><h2>Próximamente</h2><p>Recepción, producción y controles de calidad.</p><small>En construcción</small></article>
      </section>
    </main>
  `
})
export class HomeComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
