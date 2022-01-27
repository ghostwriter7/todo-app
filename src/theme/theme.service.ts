import { Injectable } from '@angular/core';
import { dark, light, Theme } from './theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private active: Theme = dark;

  public toggleTheme(): void {
    this.active = this.active === dark ? light : dark;

    this.setActiveTheme();
  }

  setActiveTheme(): void {
    Object.keys(this.active.properties).forEach(property => {
      document.documentElement.style.setProperty(property, this.active.properties[property]);
    })
  }

}
