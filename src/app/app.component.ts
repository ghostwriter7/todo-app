import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { PlaceholderDirective } from './core/directives';
import { ThemeService } from '../theme/theme.service';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './pages/auth/core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild(PlaceholderDirective, { static: true }) alertHost!: PlaceholderDirective;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private authService: AuthService
    ) {}

  ngOnInit(): void {
    this.notificationService.initHost(this.alertHost);
    this.authService.autoLogin();

    this.themeService.loadTheme();
  }
}
