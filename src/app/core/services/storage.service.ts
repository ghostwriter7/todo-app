import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public saveItem(key: string, item: any): void {
    localStorage.setItem(key, JSON.stringify(item));
  }

  public getItem(key: string): any {
    const item = localStorage.getItem(key);

    return item ? item : null;
  }

  public deleteItem(key: string): void {
    localStorage.removeItem(key);
  }

  public parseItem(item: string): any {
    return JSON.parse(item);
  }
}
