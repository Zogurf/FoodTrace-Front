import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proveedor {
  id: number;
  ruc: number;
  nombre: string;
  calificacion: number;
  activo: boolean;
}

export interface Materia {
  id: number;
  nombre: string;
  descripcion?: string;
  unidadMedida: 'KG' | 'L' | 'UNIDAD';
  activo: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  get proveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/catalogos/proveedores`);
  }

  get materias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.apiUrl}/catalogos/materias-primas`);
  }

  get productos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/catalogos/productos`);
  }

  createProveedor(value: { ruc: number; nombre: string; calificacion: number }): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.apiUrl}/catalogos/proveedores`, value);
  }

  createMateria(value: { nombre: string; descripcion: string; unidadMedida: string }): Observable<Materia> {
    return this.http.post<Materia>(`${this.apiUrl}/catalogos/materias-primas`, value);
  }

  createProducto(value: { nombre: string; descripcion: string }): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/catalogos/productos`, value);
  }
}
