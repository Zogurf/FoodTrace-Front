import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TraceBack {
  loteProduccionId: number;
  codigo: string;
  producto: string;
  estado: string;
  materiasPrimas: Array<{
    loteEntradaId: number;
    materiaPrima: string;
    proveedor: string;
    fechaRecepcion: string;
    fechaVencimiento: string;
    cantidadConsumida: number;
  }>;
}

export interface TraceForward {
  loteEntradaId: number;
  materiaPrima: string;
  proveedor: string;
  lotesProduccion: Array<{
    loteProduccionId: number;
    codigo: string;
    producto: string;
    cantidad: number;
    estado: string;
    cantidadConsumida: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class TrazabilidadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/trazabilidad';

  haciaAtras(id: number): Observable<TraceBack> {
    return this.http.get<TraceBack>(`${this.apiUrl}/hacia-atras/${id}`);
  }

  haciaAdelante(id: number): Observable<TraceForward> {
    return this.http.get<TraceForward>(`${this.apiUrl}/hacia-adelante/${id}`);
  }
}
