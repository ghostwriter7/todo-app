import { Injectable } from '@angular/core';
import { AuthService } from '../../pages/auth/core/services/auth.service';
import {
  Firestore,
  getFirestore,
  addDoc,
  collection,
  DocumentReference,
  setDoc,
  deleteDoc,
  getDocs,
  QueryConstraint, query
} from 'firebase/firestore';
import { app } from '../libs/firebase';
import { catchError, finalize, from, Observable, tap, throwError } from 'rxjs';
import { EventsService } from './events.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private _db: Firestore;

  constructor(
    private readonly _authService: AuthService,
    private readonly _eventsService: EventsService,
    private readonly _notificationService: NotificationService
  ) {
    this._db = getFirestore(app);
  }

  public getDocs(collectionName: string, ...constraints:  QueryConstraint[]): Observable<any> {
    const collectionRef = collection(this._db, collectionName);
    const q = query(collectionRef, ...constraints);

    return from(getDocs(q))
      .pipe(catchError(this.handleError.bind(this)));
  }

  public createDoc(collectionName: string, data: any): Observable<DocumentReference> {
    console.log('collection name', collectionName);
    console.log('data', data);

    return from(addDoc(collection(this._db, collectionName), data))
      .pipe(catchError(this.handleError.bind(this)),
        tap(() => console.log('DOC CREATED')));
  }

  public updateDoc(docRef: DocumentReference, data: any): Observable<void> {
    return from(setDoc(docRef, data, { merge: true }))
      .pipe(catchError(this.handleError.bind(this)),
        tap(() => console.log('DOC UPDATED')));
  }

  public deleteDoc(docRef: DocumentReference): Observable<any> {
    return from(deleteDoc(docRef))
      .pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(err: { code: string, message: string}): Observable<any> {
    console.error(err.code);
    console.error(err.message);
    let message = 'Ops, something went wrong!';

    this._notificationService.showNotification(message, 'Error');

    return throwError(() => new Error(err.message));
  }
}
