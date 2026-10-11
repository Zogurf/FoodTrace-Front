import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService, Materia, Producto, Proveedor } from './catalog.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

type Tab = 'materias' | 'productos' | 'proveedores';

@Component({
  selector: 'app-catalogos',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="shell">
      <header class="topbar">
        <a class="brand brand-link" routerLink="/home"><span class="brand-mark small">FT</span><strong>FoodTrace</strong></a>
        <div class="user-area"><span>{{ auth.session?.username }} · {{ auth.session?.rol }}</span><button class="ghost-button" (click)="logout()">Salir</button></div>
      </header>
      <section class="page-heading">
        <div><p class="eyebrow">GESTIÓN</p><h1>Catálogos</h1><p class="muted">Administra la información base de tu operación.</p></div>
        <a class="secondary-link" routerLink="/home">← Volver al inicio</a>
      </section>
      @if (auth.session?.rol === 'ADMIN') {
        <nav class="tabs">
          <button [class.active]="tab === 'materias'" (click)="select('materias')">Materias primas</button>
          <button [class.active]="tab === 'productos'" (click)="select('productos')">Productos</button>
          <button [class.active]="tab === 'proveedores'" (click)="select('proveedores')">Proveedores</button>
        </nav>
        <section class="catalog-layout">
          <form class="panel compact-form" (ngSubmit)="create()">
            <p class="eyebrow">NUEVO REGISTRO</p>
            @if (tab === 'materias') {
              <label>Nombre<input name="materiaNombre" [(ngModel)]="materia.nombre" required></label>
              <label>Unidad de medida<select name="unidad" [(ngModel)]="materia.unidadMedida"><option value="KG">Kilogramos</option><option value="L">Litros</option><option value="UNIDAD">Unidad</option></select></label>
              <label>Descripción<textarea name="materiaDescripcion" [(ngModel)]="materia.descripcion"></textarea></label>
            } @else if (tab === 'productos') {
              <label>Nombre<input name="productoNombre" [(ngModel)]="producto.nombre" required></label>
              <label>Descripción<textarea name="productoDescripcion" [(ngModel)]="producto.descripcion"></textarea></label>
            } @else {
              <label>RUC<input name="ruc" type="number" [(ngModel)]="proveedor.ruc" required></label>
              <label>Nombre<input name="proveedorNombre" [(ngModel)]="proveedor.nombre" required></label>
              <label>Calificación<select name="calificacion" [(ngModel)]="proveedor.calificacion"><option [ngValue]="0">0</option><option [ngValue]="1">1</option><option [ngValue]="2">2</option><option [ngValue]="3">3</option><option [ngValue]="4">4</option><option [ngValue]="5">5</option></select></label>
            }
            @if (error) { <p class="error">{{ error }}</p> }
            <button type="submit" [disabled]="saving">{{ saving ? 'Guardando...' : 'Guardar registro' }}</button>
          </form>
          <section class="panel table-panel">
            <div class="panel-heading"><div><p class="eyebrow">REGISTROS ACTIVOS</p><h2>{{ title }}</h2></div><button class="refresh-button" (click)="load()">Actualizar</button></div>
            @if (loading) { <p class="muted">Cargando registros...</p> }
            @if (!loading && tab === 'materias') {
              <table><thead><tr><th>Nombre</th><th>Unidad</th><th>Estado</th></tr></thead><tbody>@for (item of materias; track item.id) { <tr><td><strong>{{ item.nombre }}</strong><small>{{ item.descripcion || 'Sin descripción' }}</small></td><td>{{ item.unidadMedida }}</td><td><span class="status ok">Activo</span></td></tr> }</tbody></table>
            } @else if (!loading && tab === 'productos') {
              <table><thead><tr><th>Nombre</th><th>Descripción</th><th>Estado</th></tr></thead><tbody>@for (item of productos; track item.id) { <tr><td><strong>{{ item.nombre }}</strong></td><td>{{ item.descripcion || 'Sin descripción' }}</td><td><span class="status ok">Activo</span></td></tr> }</tbody></table>
            } @else if (!loading) {
              <table><thead><tr><th>Proveedor</th><th>RUC</th><th>Calificación</th></tr></thead><tbody>@for (item of proveedores; track item.id) { <tr><td><strong>{{ item.nombre }}</strong></td><td>{{ item.ruc }}</td><td><span class="rating">★ {{ item.calificacion }}/5</span></td></tr> }</tbody></table>
            }
          </section>
        </section>
      } @else { <section class="empty-state panel"><h2>Acceso restringido</h2><p class="muted">Solo los usuarios ADMIN pueden gestionar catálogos.</p></section> }
    </main>
  `
})
export class CatalogosComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  tab: Tab = 'materias';
  materias: Materia[] = [];
  productos: Producto[] = [];
  proveedores: Proveedor[] = [];
  materia = { nombre: '', descripcion: '', unidadMedida: 'KG' };
  producto = { nombre: '', descripcion: '' };
  proveedor = { ruc: 0, nombre: '', calificacion: 0 };
  loading = false;
  saving = false;
  error = '';

  get title(): string { return this.tab === 'materias' ? 'Materias primas' : this.tab === 'productos' ? 'Productos' : 'Proveedores'; }
  ngOnInit(): void { if (this.auth.session?.rol === 'ADMIN') this.load(); }
  select(tab: Tab): void { this.tab = tab; this.error = ''; this.load(); }
  load(): void {
    this.loading = true;
    if (this.tab === 'materias') {
      this.catalog.materias.subscribe({ next: (items) => { this.materias = items; this.loading = false; }, error: () => this.loadError() });
    } else if (this.tab === 'productos') {
      this.catalog.productos.subscribe({ next: (items) => { this.productos = items; this.loading = false; }, error: () => this.loadError() });
    } else {
      this.catalog.proveedores.subscribe({ next: (items) => { this.proveedores = items; this.loading = false; }, error: () => this.loadError() });
    }
  }
  create(): void {
    this.saving = true; this.error = '';
    const done = (): void => { this.saving = false; this.reset(); this.load(); };
    const failed = (response: { error?: { error?: string } }): void => { this.error = response.error?.error ?? 'No se pudo guardar el registro.'; this.saving = false; };
    if (this.tab === 'materias') {
      this.catalog.createMateria(this.materia).subscribe({ next: done, error: failed });
    } else if (this.tab === 'productos') {
      this.catalog.createProducto(this.producto).subscribe({ next: done, error: failed });
    } else {
      this.catalog.createProveedor(this.proveedor).subscribe({ next: done, error: failed });
    }
  }
  private loadError(): void { this.error = 'No se pudieron cargar los registros.'; this.loading = false; }
  reset(): void { this.materia = { nombre: '', descripcion: '', unidadMedida: 'KG' }; this.producto = { nombre: '', descripcion: '' }; this.proveedor = { ruc: 0, nombre: '', calificacion: 0 }; }
  logout(): void { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
