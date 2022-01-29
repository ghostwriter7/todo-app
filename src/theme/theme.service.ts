import { Injectable } from '@angular/core';
import { dark, light, Theme } from './theme';
import { StorageService } from '../app/core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private active: Theme = dark;

  constructor(private storageService: StorageService) {}

  public toggleTheme(): void {
    this.active = this.active === dark ? light : dark;

    this.saveFavoriteTheme();
    this.setActiveTheme();
  }

  public setActiveTheme(): void {
    Object.keys(this.active.properties).forEach(property => {
      document.documentElement.style.setProperty(property, this.active.properties[property]);
    });
  }

  public loadTheme(): void {
    const favoriteTheme = this.storageService.getItem('theme');
    this.active = this.storageService.parseItem(favoriteTheme) === "light" ? light : dark;
    this.setActiveTheme();
  }

  private saveFavoriteTheme(): void {
    this.storageService.saveItem('theme', this.active.name);
  }
}
