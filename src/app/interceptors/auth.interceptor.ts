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
    return req.url.includes('/api/auth') || !isPlatformBrowser(this.platformId);
  }

  private addTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();
    return token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
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
          this.router.navigate(['/login']);
          return throwError(() => new Error('Refresh token failed'));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.logout();
          this.router.navigate(['/login']);
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
}
