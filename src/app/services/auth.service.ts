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
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > (now + 30);
    } catch (error) {
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
      })
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, userData);
  }

  refreshToken(): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, {}).subscribe({
        next: (response) => {
          this.storeAuthData(response);
          resolve(true);
        },
        error: () => {
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
    if (!token) return false;

    return this.isTokenValid(token);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('token');
  }

  debugToken(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');

    console.log('=== TOKEN DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('Is logged in:', this.isLoggedIn());
    console.log('Current user:', this.getCurrentUser());

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires at:', new Date(payload.exp * 1000));
        console.log('Current time:', new Date());
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    console.log('==================');
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
