import { Injectable } from '@angular/core';
import { dark, light, Theme } from './theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private active: Theme = dark;

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
    const favoriteTheme = localStorage.getItem('theme');

    this.active = favoriteTheme === 'light' ? light : dark;
    this.setActiveTheme();
  }


  private saveFavoriteTheme(): void {
    localStorage.setItem('theme', this.active.name);
  }
}
