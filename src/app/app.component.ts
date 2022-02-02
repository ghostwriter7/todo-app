import { Component, OnInit, ViewChild } from '@angular/core';
import { PlaceholderDirective } from './core/directives';
import { ThemeService } from '../theme/theme.service';
import { NotificationService } from './core/services/notification.service';
import { AuthService } from './pages/auth/core/services/auth.service';
import { EventsService } from './core/services/events.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger("navbarAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: 'translateY(-100%)' }),
        animate(
          "500ms ease-in-out",
          style({ opacity: .9, transform: 'translateY(0)' })
        )
      ]),
      transition(":leave", [
        animate(
          "600ms ease-in-out",
          style({ opacity: 0, transform: 'translateY(-100%)' })
        )
      ])
    ])
]
})

export class AppComponent implements OnInit {
  @ViewChild(PlaceholderDirective, {static: true}) alertHost!: PlaceholderDirective;

  constructor(
    private themeService: ThemeService,
    private notificationService: NotificationService,
    public authService: AuthService,
    public eventsService: EventsService
  ) {
  }

  ngOnInit(): void {
    this.notificationService.initHost(this.alertHost);
    this.authService.autoLogin();

    this.themeService.loadTheme();
  }
}
