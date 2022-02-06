import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private _baseURL = 'http://18.159.52.1:3000/api/calendar';

  constructor(
    private _http: HttpClient
  ) {}

  getMonthData(year: number, month: string): void {
    this._http.get(`${this._baseURL}/${year}/${month}`).subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
