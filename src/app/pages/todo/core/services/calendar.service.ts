import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, finalize, ReplaySubject, switchMap, take } from 'rxjs';
import { AuthService } from '../../../auth/core/services/auth.service';
import {
  Firestore,
  getFirestore,
  getDocs,
  query,
  where,
  collection,
  DocumentReference
} from 'firebase/firestore';
import { app } from '../../../../core/libs/firebase';
import { EventsService } from '../../../../core/services/events.service';
import { FirestoreService } from '../../../../core/services/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService implements OnInit {
  private currentYear = new Date().getFullYear();
  private currentMonth = new Date().getMonth();
  private  calendarData: { [key:string]: any, date: number, isToday: boolean, hasPassed: boolean, total?: number, completed?: number }[] = [];
  public currentYearSubject = new BehaviorSubject<number>(this.currentYear);
  public currentMonthSubject = new BehaviorSubject<number>(this.currentMonth);
  public calendarSubject = new BehaviorSubject<{ date: number, isToday: boolean, hasPassed: boolean, total?: number, completed?: number }[]>(this.calendarData);

  private readonly db!: Firestore;

  private monthData: any;
  public monthDocRef?: DocumentReference;
  public monthDocSubject$ = new BehaviorSubject<DocumentReference | undefined>(this.monthDocRef);
  public monthDocRef$ = this.monthDocSubject$.asObservable();

  public currentYear$ = this.currentYearSubject.asObservable();
  public currentMonth$ = this.currentMonthSubject.asObservable();

  private startingGapSubject = new ReplaySubject<string>(1);
  private endingGapSubject = new ReplaySubject<string>(1);
  public startingGap$ = this.startingGapSubject.asObservable();
  public endingGap$ = this.endingGapSubject.asObservable();

  constructor(
    private readonly _authService: AuthService,
    private readonly _eventsService: EventsService,
    private readonly _firestoreService: FirestoreService
  ) {
    this.db = getFirestore(app);
  }

  ngOnInit(): void {
  }

  public fetchMonth(year: number, month: number): void {
    this._eventsService.startLoading();

    this._authService.user$.pipe(
      take(1),
      switchMap(user => {
        const matchCreator = where('creator', '==', user!.id);
        const matchYear = where('year', '==', year);
        const matchMonth = where('month', '==', month);

        return this._firestoreService.getDocs('months', matchCreator, matchYear, matchMonth);
      }),
      finalize(() => this._eventsService.stopLoading()))
      .subscribe({
        next: (querySnapshot) => {
          if (querySnapshot.docs.length) {
            this.monthData = querySnapshot.docs[0].data();
            this.monthDocRef = querySnapshot.docs[0].ref;
            this.monthDocSubject$.next(this.monthDocRef);
            const days = new Array(31).fill((0)).map((_, idx) => (idx + 1).toString());

            for (let key in this.monthData) {
              if (days.includes(key)) {
                this.calendarData[+key - 1]['total'] = this.monthData[key].total;
                this.calendarData[+key - 1]['completed'] = this.monthData[key].completed;
                this.calendarSubject.next(this.calendarData);
              }
            }
          } else {
            this.monthDocRef = undefined;
            this.monthDocSubject$.next(undefined);
          }
        },
        error: (err) => {
          console.log(err);
        }
      });
  }

  public renderCalendar(): void {
    const today = new Date();

    const numberOfDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    let firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    let lastDay = new Date(this.currentYear, this.currentMonth, numberOfDays).getDay();

    firstDay = firstDay ? firstDay : 7;
    lastDay = lastDay ? lastDay : 7;
    this.calendarData = [];

    for (let i = 1; i <= numberOfDays; i++) {
      this.calendarData.push({
        date: i,
        isToday: false,
        hasPassed: new Date(this.currentYear, this.currentMonth, i).getTime() < today.getTime() });
    }

    if (this.currentYear === today.getFullYear() && this.currentMonth === today.getMonth()) {
      const currentDay = this.calendarData.find(tile => tile.date === today.getDate());
      currentDay!.isToday = true;
      currentDay!.hasPassed = false;
    }

    const startingGap = 100 - (7 - firstDay + 1) * (100 / 7) + '%';
    const endingGap = 100 - (lastDay * (100 / 7)) + '%';

    this.endingGapSubject.next(endingGap);
    this.startingGapSubject.next(startingGap);
    this.calendarSubject.next(this.calendarData);
  }

  public setPreviousYear(): void {
    this.currentYear--;
    this.currentYearSubject.next(this.currentYear);
    this.renderCalendar();
  }

  public setNextYear(): void {
    this.currentYear++;
    this.currentYearSubject.next(this.currentYear);
    this.renderCalendar();
  }

  public setMonth(month: number): void {
    this.currentMonth = month;
    this.currentMonthSubject.next(this.currentMonth);
    this.renderCalendar();
  }

  public setDate(year: number, month: number): void {
    this.currentMonth = month;
    this.currentYear = year;

    this.currentMonthSubject.next(this.currentMonth);
    this.currentYearSubject.next(this.currentYear);
  }

}
