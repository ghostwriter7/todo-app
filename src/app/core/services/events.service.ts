import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private loadingSubject = new Subject<boolean>();
  public loading$ = this.loadingSubject.asObservable();

  public startLoading(): void {
    this.loadingSubject.next(true);
  }

  public stopLoading(): void {
    this.loadingSubject.next(false);
  }
}
