import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, from, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, take, filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<any>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (this.shouldSkipInterceptor(req)) {
      return next.handle(req);
    }

    const authReq = this.addTokenToRequest(req);

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private shouldSkipInterceptor(req: HttpRequest<any>): boolean {
    const skipUrls = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/exercises',
      '/api/languages'
    ];

    const shouldSkip = skipUrls.some(url => req.url.includes(url)) || !isPlatformBrowser(this.platformId);

    if (req.url.includes('/api/auth')) {
      console.log('Auth interceptor - skipping URL:', req.url, 'shouldSkip:', shouldSkip);
    }

    return shouldSkip;
  }

  private addTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return req;
    }

    const token = this.authService.getToken();
    if (token && this.authService.hasValidToken()) {
      return req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return req;
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      return from(this.authService.refreshToken()).pipe(
        switchMap((success) => {
          this.isRefreshing = false;
          if (success) {
            this.refreshSubject.next(success);
            return next.handle(this.addTokenToRequest(request));
          }

          this.handleAuthFailure();
          return throwError(() => new Error('Refresh token failed'));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.handleAuthFailure();
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshSubject.pipe(
        filter(result => result !== null),
        take(1),
        switchMap(() => next.handle(this.addTokenToRequest(request)))
      );
    }
  }

  private handleAuthFailure(): void {
    this.authService.logout();
    if (this.router.url !== '/login' && this.router.url !== '/register') {
      this.router.navigate(['/login']);
    }
  }
}
