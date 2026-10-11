import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="auth-layout">
      <section class="brand-panel">
        <span class="brand-mark">FT</span>
        <p class="eyebrow">TRAZABILIDAD ALIMENTARIA</p>
        <h1>Todo el recorrido de tus alimentos, en un solo lugar.</h1>
        <p class="muted">Gestiona calidad, materias primas y productos con FoodTrace.</p>
      </section>
      <section class="form-panel">
        <div class="form-card">
          <p class="eyebrow">BIENVENIDO</p>
          <h2>Iniciar sesión</h2>
          <p class="muted">Ingresa tus credenciales para continuar.</p>
          <form (ngSubmit)="submit()">
            <label for="username">Usuario</label>
            <input id="username" name="username" [(ngModel)]="username" autocomplete="username" required>
            <label for="password">Contraseña</label>
            <input id="password" name="password" [(ngModel)]="password" type="password" autocomplete="current-password" required>
            @if (error) { <p class="error">{{ error }}</p> }
            <button type="submit" [disabled]="loading || !username || !password">
              {{ loading ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>
        </div>
      </section>
    </main>
  `
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  username = '';
  password = '';
  loading = false;
  error = '';

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/home'),
      error: (response: { error?: { message?: string } }) => {
        this.error = response.error?.message ?? 'No se pudo iniciar sesión. Verifica tus datos.';
        this.loading = false;
      }
    });
  }
}
