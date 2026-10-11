import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  username: string;
  rol: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly storageKey = 'foodtrace-auth';

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => localStorage.setItem(this.storageKey, JSON.stringify(response)))
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  get session(): AuthResponse | null {
    const value = localStorage.getItem(this.storageKey);
    if (!value) return null;
    try {
      return JSON.parse(value) as AuthResponse;
    } catch {
      this.logout();
      return null;
    }
  }

  get token(): string | null {
    return this.session?.token ?? null;
  }

  get isAuthenticated(): boolean {
    return this.token !== null;
  }
}
