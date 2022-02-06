import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private _baseURL = 'https://todo-app-api-pb8f2a9vn-ghostwriter7.vercel.app/api/calendar';

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
