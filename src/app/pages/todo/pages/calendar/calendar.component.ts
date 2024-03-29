import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { CalendarService } from '../../core/services/calendar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {
  public readonly months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];

  public currentMonth!: number;
  public currentYear!: number;

  private subscription!: Subscription;

  constructor(
    private router: Router,
    public readonly _calendarService: CalendarService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.subscription = combineLatest(
        [this._calendarService.currentMonth$,
          this._calendarService.currentYear$]
      ).pipe()
      .subscribe(([month, year]) => {
        console.log(month, 'month');
        console.log(year, 'year');
        this.currentYear = year;
        this.currentMonth = month;
        this._calendarService.renderCalendar();
        this._calendarService.fetchMonth(year, month);
      });
    }, 0);
  }

  public onPrevYear(): void {
    this._calendarService.setPreviousYear();
  }

  public onNextYear(): void {
    this._calendarService.setNextYear();
  }

  public onMonthSelected(month: number): void {
    this._calendarService.setMonth(month);
  }

  onSelectDate(date: number): void {
    const path = `${date.toString().padStart(2, '0')}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${this.currentYear}`;
    this.router.navigate(['/todo', path]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
