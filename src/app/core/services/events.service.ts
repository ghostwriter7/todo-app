import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  public startLoading(): void {
    this.loadingSubject.next(true);
  }

  public stopLoading(): void {
    this.loadingSubject.next(false);
  }
}
