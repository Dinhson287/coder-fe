import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user.model';

interface LoginResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  role: string;
  expiresIn: number;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');

    if (token && userData) {
      try {

        if (this.isTokenValid(token)) {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
        } else {

          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    }
  }

  private isTokenValid(token: string): boolean {
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > (now + 60);
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        if (response.token && isPlatformBrowser(this.platformId)) {
          this.storeAuthData(response);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, userData);
  }


  refreshToken(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve(false);
    }

    const currentToken = this.getToken();
    if (!currentToken) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {

      this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, {}).subscribe({
        next: (response) => {
          if (response.token) {
            this.storeAuthData(response);
            resolve(true);
          } else {
            this.logout();
            resolve(false);
          }
        },
        error: (error) => {
          console.error('Refresh token failed:', error);
          this.logout();
          resolve(false);
        }
      });
    });
  }

  isTokenExpiringSoon(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return (payload.exp - now) < 300;
    } catch {
      return true;
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();

    return token !== null && user !== null && this.isTokenValid(token);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('token');
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    return token !== null && this.isTokenValid(token);
  }

  private storeAuthData(response: LoginResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem('token', response.token);

    const user: User = {
      id: response.userId,
      username: response.username,
      email: response.email,
      role: response.role as 'USER' | 'ADMIN',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
