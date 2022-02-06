import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, tap, throwError } from 'rxjs';
import { IUser, IAuthResponse } from '../interfaces';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Router } from '@angular/router';
import { EventsService } from '../../../../core/services/events.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseURL = 'https://todo-app-api-pb8f2a9vn-ghostwriter7.vercel.app/api/auth';
  private user: IUser | null = null;
  private userSubject = new BehaviorSubject<IUser | null>(this.user);
  private timer: any;

  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private router: Router,
    private eventsService: EventsService
  ) {}

  public login(email: string, password: string): Observable<any> {
    this.eventsService.startLoading();

    return this.http.post<IAuthResponse>(`${this.baseURL}/login`, { email, password })
    .pipe(
      tap(this.handleSuccess.bind(this)),
      catchError(this.handleError.bind(this)),
      finalize(() => this.eventsService.stopLoading())
    );
  }

  public signup(email: string, password: string): Observable<any> {
    this.eventsService.startLoading();

    return this.http.post<IAuthResponse>(`${this.baseURL}/signup`, { email, password })
    .pipe(
      tap(this.handleSuccess.bind(this)),
      catchError(this.handleError.bind(this)),
      finalize(() => this.eventsService.stopLoading())
      );
  }

  public logout(): void {
    this.user = null;
    this.userSubject.next(null);
    this.storageService.deleteItem('auth');

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.router.navigate(['/auth/login']);
  }

  public autoLogin(): void {
    const auth = this.storageService.getItem('auth');

    if (auth) {
      const authData = this.storageService.parseItem(auth);
      authData.expirationDate = new Date(authData.expirationDate);

      if (Date.now() < authData.expirationDate.getTime()) {
        this.user = authData;
        this.userSubject.next(this.user);
        this.initAutoLogout();

        this.router.navigate(['/todo', 'calendar']).then(() => {
          this.notificationService.showNotification("Welcome back & good luck!", 'Success');
        });
      }
    }
  }

  private initAutoLogout(): void {
    const timeLeft = this.user!.expirationDate.getTime() - Date.now();

    this.timer = setTimeout(() => this.logout(), timeLeft);
  }

  private handleSuccess({ email, id, token }: IAuthResponse): void {
    this.user = { email, id, token, expirationDate: new Date(Date.now() + 3600 * 1000)};
    this.userSubject.next(this.user);

    this.storageService.saveItem('auth', this.user);

    this.initAutoLogout();
  }

  private handleError({ error }: HttpErrorResponse): Observable<any> {
    this.notificationService.showNotification(error.error, 'Error');
    return throwError(() => new Error(error.error));
  }
}
