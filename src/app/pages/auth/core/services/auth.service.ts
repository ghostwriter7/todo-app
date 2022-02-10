import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUser, IAuthResponse } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Router } from '@angular/router';
import { EventsService } from '../../../../core/services/events.service';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth } from 'firebase/auth';
import { app } from '../../../../core/libs/firebase';
import firebase from 'firebase/compat';
import UserCredential = firebase.auth.UserCredential;


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseURL = 'https://todo-app-api-pb8f2a9vn-ghostwriter7.vercel.app/api/auth';
  private user: IUser | null = null;
  public userSubject = new BehaviorSubject<IUser | null>(this.user);
  private timer: any;
  private readonly auth!: Auth;

  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private storageService: StorageService,
    private router: Router,
    private eventsService: EventsService
  ) {
    this.auth = getAuth(app);
  }

  public login(email: string, password: string) {
    this.eventsService.startLoading();

    signInWithEmailAndPassword(this.auth, email, password)
      .then(this.handleSuccess.bind(this))
      .catch(this.handleError.bind(this))
      .finally(() => this.eventsService.stopLoading());
  }

  public signup(email: string, password: string) {
    this.eventsService.startLoading();

    createUserWithEmailAndPassword(this.auth, email, password)
      .then(this.handleSuccess.bind(this))
      .catch(this.handleError.bind(this))
      .finally(() => this.eventsService.stopLoading())

  }

  public logout(): void {
    signOut(this.auth)
    .then(() => {
      this.user = null;
      this.userSubject.next(null);
      this.storageService.deleteItem('auth');
      this.router.navigate(['/auth/login']);
      if (this.timer) {
        clearTimeout(this.timer);
      }
    })
    .catch(this.handleError.bind(this));
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

  private handleSuccess(data: any): void {
    this.user = {
      email: data._tokenResponse.email,
      id: data._tokenResponse.localId,
      token: data._tokenResponse.idToken,
      expirationDate: new Date(Date.now() + data._tokenResponse.expiresIn * 1000)
    };
    this.userSubject.next(this.user);

    this.router.navigate(['/todo/calendar']);

    this.storageService.saveItem('auth', this.user);

    this.initAutoLogout();
  }

  private handleError(error: any) {
    let message = '';

    switch (error.code) {
      case 'auth/wrong-password': {
        message = 'Invalid credentials!';
        break;
      }
      case 'auth/user-not-found': {
        message = 'There is no such account!';
        break;
      }
      case 'auth/email-already-in-use': {
        message = 'This e-mail is already registered!';
        break;
      }
      default: {
        message = 'Ops! Something went wrong!';
        break;
      }
    }

    this.notificationService.showNotification(message, 'Error');
  }
}
