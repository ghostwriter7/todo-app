import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from '../../pages/auth/core/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('auth')) {
      return next.handle(req);
    }

    return this.authService.user$.pipe(
      take(1),
      switchMap(user => {
        const newReq = req.clone({ headers: req.headers.append('token', user!.token) });

        return next.handle(newReq);
      })
    );
  }
}
