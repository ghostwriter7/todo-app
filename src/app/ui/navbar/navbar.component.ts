import { Component } from '@angular/core';
import { AuthService } from '../../pages/auth/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  constructor(private authService: AuthService) {}

  public onLogout(): void {
    this.authService.logout();
  }
}
