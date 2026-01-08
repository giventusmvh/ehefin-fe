import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse } from '../models';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly _token = signal<string | null>(null);
  private readonly _user = signal<AuthResponse | null>(null);

  constructor() {
    // Initialize from localStorage only on browser platform
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      if (token) {
        this._token.set(token);
      }
      if (user) {
        this._user.set(JSON.parse(user));
      }
    }
  }

  readonly isAuthenticated = computed(() => !!this._token());
  readonly user = computed(() => this._user());
  readonly roles = computed(() => this._user()?.roles ?? []);
  readonly permissions = computed(() => this._user()?.permissions ?? []);

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            this.setSession(response.data);
          }
        })
      );
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      })
    );
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  private setSession(auth: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, auth.token);
      localStorage.setItem(USER_KEY, JSON.stringify(auth));
    }
    this._token.set(auth.token);
    this._user.set(auth);
  }

  private clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this._token.set(null);
    this._user.set(null);
  }
}
