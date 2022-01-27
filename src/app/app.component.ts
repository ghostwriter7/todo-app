import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { TodoService } from './core/services/todo.service';
import { PlaceholderDirective } from './core/directives/placeholder.directive';
import { NotificationComponent } from './ui/notification/notification.component';
import { Subscription } from 'rxjs';
import { ThemeService } from '../theme/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild(PlaceholderDirective, { static: true }) alertHost!: PlaceholderDirective;

  private subscription!: Subscription;

  constructor(
    private todosService: TodoService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private themeService: ThemeService
    ) {}

  ngOnInit(): void {
    this.todosService.loadTodosFromStorage();

    this.todosService.error$.subscribe((error) => {
      this.showErrorAlert(error);
    });

    this.themeService.loadTheme();
  }

  private showErrorAlert(error: string): void {
    const alertFactory = this.componentFactoryResolver.resolveComponentFactory(NotificationComponent);

    this.alertHost.viewContainerRef.clear();

    const component = this.alertHost.viewContainerRef.createComponent(alertFactory);

    component.instance.message = error;
    this.subscription = component.instance.close.subscribe(() => {
      this.subscription.unsubscribe();
      this.alertHost.viewContainerRef.clear();
    });
  }
}
