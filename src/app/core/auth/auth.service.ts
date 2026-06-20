import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  AuthResponse,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
} from '../api/models/auth.types';
import { MessageResponse } from '../api/models/api.types';
import { UserPrivate } from '../api/models/user.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storageKey = 'unibook.auth.session';
  private readonly sessionState = signal<AuthResponse | null>(this.readStoredSession());
  private refreshRequest: Promise<AuthResponse> | null = null;

  readonly session = computed(() => this.sessionState());
  readonly token = computed(() => this.sessionState()?.token ?? null);
  readonly currentUser = computed(() => this.sessionState()?.user ?? null);
  readonly isAuthenticated = computed(() => Boolean(this.token()));

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await firstValueFrom(this.http.post<AuthResponse>('/auth-register', payload));
    this.persistSession(response);
    return response;
  }

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await firstValueFrom(this.http.post<AuthResponse>('/auth-login', payload));
    this.persistSession(response);
    return response;
  }

  async refreshSession(): Promise<AuthResponse> {
    const session = this.sessionState();
    if (!session?.refreshToken) {
      throw new Error('Refresh token mancante');
    }

    if (!this.refreshRequest) {
      this.refreshRequest = this.performRefresh(session.refreshToken);
    }

    try {
      return await this.refreshRequest;
    } finally {
      this.refreshRequest = null;
    }
  }

  async logout(): Promise<void> {
    const session = this.sessionState();

    try {
      if (session) {
        await firstValueFrom(
          this.http.post<MessageResponse>('/auth-logout', {
            refreshToken: session.refreshToken,
          }),
        );
      }
    } finally {
      this.clearSession();
      await this.router.navigateByUrl('/login');
    }
  }

  updateCurrentUser(user: UserPrivate): void {
    const session = this.sessionState();
    if (!session) {
      return;
    }
    this.persistSession({ ...session, user });
  }

  clearSession(): void {
    this.refreshRequest = null;
    this.sessionState.set(null);
    localStorage.removeItem(this.storageKey);
  }

  private persistSession(session: AuthResponse): void {
    this.sessionState.set(session);
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  private async performRefresh(refreshToken: string): Promise<AuthResponse> {
    const response = await firstValueFrom(
      this.http.post<RefreshTokenResponse>('/auth-refresh', {
        refreshToken,
      }),
    );

    const currentSession = this.sessionState();
    if (!currentSession || currentSession.refreshToken !== refreshToken) {
      throw new Error('Sessione non disponibile');
    }

    const updatedSession: AuthResponse = {
      ...currentSession,
      token: response.token,
      refreshToken: response.refreshToken,
    };

    this.persistSession(updatedSession);
    return updatedSession;
  }

  private readStoredSession(): AuthResponse | null {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as AuthResponse;
      return parsed.token && parsed.refreshToken ? parsed : null;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
