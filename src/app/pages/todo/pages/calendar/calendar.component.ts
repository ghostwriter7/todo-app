import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  public readonly months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'];

  public currentYear = new Date().getFullYear();
  public currentMonth = new Date().getMonth();

  public numberOfDays!: number;
  public firstDay!: number;
  public lastDay!: number;

  public startingGap!: string;
  public endingGap!: string;

  public calendarData: { date: number, isToday: boolean, hasPassed: boolean }[] = [];

  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.renderCalendar();
  }

  public onPrevYear(): void {
    this.currentYear--;
    this.renderCalendar();
  }

  public onNextYear(): void {
    this.currentYear++;
    this.renderCalendar();
  }

  public onMonthSelected(month: number): void {
    this.currentMonth = month;
    this.renderCalendar();
  }

  public renderCalendar(): void {
    const today = new Date();

    this.numberOfDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    this.firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    this.lastDay = new Date(this.currentYear, this.currentMonth, this.numberOfDays).getDay();

    this.firstDay = this.firstDay ? this.firstDay : 7;
    this.lastDay = this.lastDay ? this.lastDay : 7;
    this.calendarData = [];

    for (let i = 1; i <= this.numberOfDays; i++) {
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

    this.startingGap = 100 - (7 - this.firstDay + 1) * (100 / 7) + '%';
    this.endingGap = 100 - (this.lastDay * (100 / 7)) + '%';
  }

  onSelectDate(date: number): void {
    const path = `${date.toString().padStart(2, '0')}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${this.currentYear}`;
    this.router.navigate(['/todo', path]);
  }
}
