import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../pages/auth/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  public path!: string;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const today = new Date();
    const date = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    this.path = `${date}-${month}-${today.getFullYear()}`;
  }

  public onLogout(): void {
    this.authService.logout();
  }
}
