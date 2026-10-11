import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { TraceBack, TraceForward, TrazabilidadService } from './trazabilidad.service';

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="shell">
      <header class="topbar"><a class="brand brand-link" routerLink="/home"><span class="brand-mark small">FT</span><strong>FoodTrace</strong></a><div class="user-area"><span>{{ auth.session?.username }}</span><button class="ghost-button" (click)="logout()">Salir</button></div></header>
      <section class="page-heading"><div><p class="eyebrow">CONSULTA</p><h1>Trazabilidad</h1><p class="muted">Sigue el recorrido de tus lotes hacia atrás o hacia adelante.</p></div><a class="secondary-link" routerLink="/home">← Volver al inicio</a></section>
      <section class="trace-search">
        <div class="panel"><p class="eyebrow">HACIA ATRÁS</p><h2>Desde un lote producido</h2><p class="muted">Conoce las materias primas utilizadas.</p><div class="inline-form"><input type="number" [(ngModel)]="backId" placeholder="ID del lote"><button (click)="searchBack()" [disabled]="loading">Consultar</button></div></div>
        <div class="panel"><p class="eyebrow">HACIA ADELANTE</p><h2>Desde un lote recibido</h2><p class="muted">Conoce los productos que lo consumieron.</p><div class="inline-form"><input type="number" [(ngModel)]="forwardId" placeholder="ID del lote"><button (click)="searchForward()" [disabled]="loading">Consultar</button></div></div>
      </section>
      @if (error) { <p class="error trace-error">{{ error }}</p> }
      @if (back) { <section class="panel result"><div class="result-title"><div><p class="eyebrow">LOTE PRODUCIDO #{{ back.loteProduccionId }}</p><h2>{{ back.codigo }}</h2><p class="muted">{{ back.producto }}</p></div><span class="status" [class.ok]="back.estado === 'LIBERADO'">{{ back.estado }}</span></div><h3>Materias primas utilizadas</h3><div class="trace-items">@for (item of back.materiasPrimas; track item.loteEntradaId) { <div class="trace-item"><strong>{{ item.materiaPrima }}</strong><span>{{ item.cantidadConsumida }} unidades · {{ item.proveedor }}</span></div> } @empty { <p class="muted">No hay consumos registrados.</p> }</div></section> }
      @if (forward) { <section class="panel result"><div class="result-title"><div><p class="eyebrow">LOTE RECIBIDO #{{ forward.loteEntradaId }}</p><h2>{{ forward.materiaPrima }}</h2><p class="muted">{{ forward.proveedor }}</p></div></div><h3>Productos relacionados</h3><div class="trace-items">@for (item of forward.lotesProduccion; track item.loteProduccionId) { <div class="trace-item"><strong>{{ item.codigo }} · {{ item.producto }}</strong><span>{{ item.cantidadConsumida }} consumidas · {{ item.estado }}</span></div> } @empty { <p class="muted">No hay producciones relacionadas.</p> }</div></section> }
    </main>
  `
})
export class TrazabilidadComponent {
  readonly auth = inject(AuthService);
  private readonly service = inject(TrazabilidadService);
  private readonly router = inject(Router);
  backId: number | null = null; forwardId: number | null = null; back: TraceBack | null = null; forward: TraceForward | null = null; loading = false; error = '';
  searchBack(): void { if (!this.backId) return; this.loading = true; this.error = ''; this.forward = null; this.service.haciaAtras(this.backId).subscribe({ next: (result) => { this.back = result; this.loading = false; }, error: () => { this.error = 'No se encontró el lote de producción solicitado.'; this.loading = false; } }); }
  searchForward(): void { if (!this.forwardId) return; this.loading = true; this.error = ''; this.back = null; this.service.haciaAdelante(this.forwardId).subscribe({ next: (result) => { this.forward = result; this.loading = false; }, error: () => { this.error = 'No se encontró el lote de entrada solicitado.'; this.loading = false; } }); }
  logout(): void { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
