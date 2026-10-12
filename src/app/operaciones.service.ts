import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OperacionResponse {
  id?: number;
  codigo?: string;
  estado?: string;
}

@Injectable({ providedIn: 'root' })
export class OperacionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  recibir(value: {
    proveedorId: number;
    materiaPrimaId: number;
    fechaVencimiento: string;
    cantidad: number;
  }): Observable<OperacionResponse> {
    return this.http.post<OperacionResponse>(`${this.apiUrl}/trazabilidad/recepciones`, value);
  }

  producir(value: {
    productoId: number;
    codigo: string;
    cantidad: number;
    fechaProduccion: string;
    consumos: Array<{ loteEntradaId: number; cantidadConsumida: number }>;
  }): Observable<OperacionResponse> {
    return this.http.post<OperacionResponse>(`${this.apiUrl}/trazabilidad/producciones`, value);
  }

  controlarCalidad(value: {
    loteProduccionId: number;
    evidencia?: string;
    observacion: string;
    dictamen: 'APROBADO' | 'RECHAZADO';
  }): Observable<OperacionResponse> {
    return this.http.post<OperacionResponse>(`${this.apiUrl}/calidad/controles`, value);
  }
}
