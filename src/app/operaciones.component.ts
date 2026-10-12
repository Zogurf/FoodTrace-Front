import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { CatalogService, Materia, Producto, Proveedor } from './catalog.service';
import { OperacionesService } from './operaciones.service';

type OperationTab = 'recepcion' | 'produccion' | 'calidad';

@Component({
  selector: 'app-operaciones',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="shell">
      <header class="topbar">
        <a class="brand brand-link" routerLink="/home"><span class="brand-mark small">FT</span><strong>FoodTrace</strong></a>
        <div class="user-area"><span>{{ auth.session?.username }} · {{ auth.session?.rol }}</span><button class="ghost-button" (click)="logout()">Salir</button></div>
      </header>
      <section class="page-heading">
        <div><p class="eyebrow">OPERACIÓN</p><h1>Registrar actividad</h1><p class="muted">Registra movimientos y controles para mantener la trazabilidad.</p></div>
        <a class="secondary-link" routerLink="/home">← Volver al inicio</a>
      </section>
      <nav class="tabs">
        <button [class.active]="tab === 'recepcion'" (click)="tab = 'recepcion'">Recepción</button>
        <button [class.active]="tab === 'produccion'" (click)="tab = 'produccion'">Producción</button>
        <button [class.active]="tab === 'calidad'" (click)="tab = 'calidad'">Control de calidad</button>
      </nav>
      <section class="operation-layout">
        <form class="panel operation-form" (ngSubmit)="submit()">
          @if (tab === 'recepcion') {
            <p class="eyebrow">NUEVA RECEPCIÓN</p><h2>Registrar lote de entrada</h2>
            <label>Proveedor<select name="proveedorId" [(ngModel)]="reception.proveedorId" required><option [ngValue]="0">Selecciona un proveedor</option>@for (item of proveedores; track item.id) { <option [ngValue]="item.id">{{ item.nombre }}</option> }</select></label>
            <label>Materia prima<select name="materiaId" [(ngModel)]="reception.materiaPrimaId" required><option [ngValue]="0">Selecciona una materia</option>@for (item of materias; track item.id) { <option [ngValue]="item.id">{{ item.nombre }} ({{ item.unidadMedida }})</option> }</select></label>
            <label>Cantidad<input name="cantidadRecepcion" type="number" min="0.01" step="0.01" [(ngModel)]="reception.cantidad" required></label>
            <label>Fecha de vencimiento<input name="vencimiento" type="date" [(ngModel)]="reception.fechaVencimiento" required></label>
          } @else if (tab === 'produccion') {
            <p class="eyebrow">NUEVA PRODUCCIÓN</p><h2>Registrar lote producido</h2>
            <label>Producto<select name="productoId" [(ngModel)]="production.productoId" required><option [ngValue]="0">Selecciona un producto</option>@for (item of productos; track item.id) { <option [ngValue]="item.id">{{ item.nombre }}</option> }</select></label>
            <label>Código del lote<input name="codigo" [(ngModel)]="production.codigo" placeholder="Ej. LOTE-2026-002" required></label>
            <label>Cantidad producida<input name="cantidadProduccion" type="number" min="0.01" step="0.01" [(ngModel)]="production.cantidad" required></label>
            <label>Fecha de producción<input name="fechaProduccion" type="date" [(ngModel)]="production.fechaProduccion" required></label>
            <div class="two-fields"><label>ID lote de entrada<input name="loteEntradaId" type="number" min="1" [(ngModel)]="production.loteEntradaId" required></label><label>Cantidad consumida<input name="cantidadConsumida" type="number" min="0.01" step="0.01" [(ngModel)]="production.cantidadConsumida" required></label></div>
          } @else {
            <p class="eyebrow">NUEVO CONTROL</p><h2>Evaluar lote de producción</h2>
            <label>ID lote de producción<input name="loteProduccionId" type="number" min="1" [(ngModel)]="quality.loteProduccionId" required></label>
            <label>Dictamen<select name="dictamen" [(ngModel)]="quality.dictamen"><option value="APROBADO">Aprobado</option><option value="RECHAZADO">Rechazado</option></select></label>
            <label>Observación<textarea name="observacion" [(ngModel)]="quality.observacion" required placeholder="Describe el resultado del control"></textarea></label>
            <label>Evidencia (opcional)<input name="evidencia" [(ngModel)]="quality.evidencia" placeholder="URL o referencia"></label>
          }
          @if (message) { <p class="success">{{ message }}</p> }
          @if (error) { <p class="error">{{ error }}</p> }
          <button type="submit" [disabled]="saving">{{ saving ? 'Enviando...' : 'Guardar operación' }}</button>
        </form>
        <aside class="panel help-panel">
          <span class="help-icon">i</span><h2>{{ helpTitle }}</h2><p class="muted">{{ helpText }}</p>
          <div class="workflow"><span>01</span><p>{{ stepOne }}</p><span>02</span><p>{{ stepTwo }}</p><span>03</span><p>{{ stepThree }}</p></div>
        </aside>
      </section>
    </main>
  `
})
export class OperacionesComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly catalog = inject(CatalogService);
  private readonly operations = inject(OperacionesService);
  private readonly router = inject(Router);
  tab: OperationTab = 'recepcion';
  proveedores: Proveedor[] = [];
  materias: Materia[] = [];
  productos: Producto[] = [];
  reception = { proveedorId: 0, materiaPrimaId: 0, fechaVencimiento: '', cantidad: 0 };
  production = { productoId: 0, codigo: '', cantidad: 0, fechaProduccion: '', loteEntradaId: 0, cantidadConsumida: 0 };
  quality = { loteProduccionId: 0, evidencia: '', observacion: '', dictamen: 'APROBADO' as 'APROBADO' | 'RECHAZADO' };
  saving = false; error = ''; message = '';

  ngOnInit(): void {
    this.catalog.proveedores.subscribe({ next: (items) => this.proveedores = items, error: () => this.error = 'No se pudieron cargar los proveedores.' });
    this.catalog.materias.subscribe({ next: (items) => this.materias = items, error: () => this.error = 'No se pudieron cargar las materias primas.' });
    this.catalog.productos.subscribe({ next: (items) => this.productos = items, error: () => this.error = 'No se pudieron cargar los productos.' });
  }

  get helpTitle(): string { return this.tab === 'recepcion' ? 'Entrada de materia prima' : this.tab === 'produccion' ? 'Transformación' : 'Liberación de lote'; }
  get helpText(): string { return this.tab === 'recepcion' ? 'El lote se crea inicialmente en estado CUARENTENA para su posterior revisión.' : this.tab === 'produccion' ? 'Relaciona el nuevo lote con un lote de entrada existente y descuenta su consumo.' : 'El dictamen actualiza automáticamente el estado del lote producido.'; }
  get stepOne(): string { return this.tab === 'recepcion' ? 'Selecciona proveedor y materia prima.' : this.tab === 'produccion' ? 'Selecciona el producto final.' : 'Indica el lote que será evaluado.'; }
  get stepTwo(): string { return this.tab === 'recepcion' ? 'Indica cantidad y vencimiento.' : this.tab === 'produccion' ? 'Escribe un código único y cantidad.' : 'Elige el dictamen del control.'; }
  get stepThree(): string { return this.tab === 'recepcion' ? 'Guarda para iniciar la cuarentena.' : this.tab === 'produccion' ? 'Vincula un lote de entrada.' : 'Registra la observación del responsable.'; }

  submit(): void {
    this.saving = true; this.error = ''; this.message = '';
    const done = (text: string): void => { this.saving = false; this.message = text; };
    const failed = (response: { error?: { error?: string } }): void => { this.saving = false; this.error = response.error?.error ?? 'No se pudo guardar la operación.'; };
    if (this.tab === 'recepcion') {
      this.operations.recibir(this.reception).subscribe({ next: (result) => done(`Recepción creada${result.id ? ` con ID ${result.id}` : ''}.`), error: failed });
    } else if (this.tab === 'produccion') {
      this.operations.producir({ productoId: this.production.productoId, codigo: this.production.codigo, cantidad: this.production.cantidad, fechaProduccion: this.production.fechaProduccion, consumos: [{ loteEntradaId: this.production.loteEntradaId, cantidadConsumida: this.production.cantidadConsumida }] }).subscribe({ next: (result) => done(`Producción creada${result.id ? ` con ID ${result.id}` : ''}.`), error: failed });
    } else {
      this.operations.controlarCalidad(this.quality).subscribe({ next: () => done('Control de calidad registrado correctamente.'), error: failed });
    }
  }
  logout(): void { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
