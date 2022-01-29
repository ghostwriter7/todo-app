import { ComponentFactoryResolver, Injectable, OnInit, ViewChild, ViewContainerRef, ViewRef } from '@angular/core';
import { NotificationComponent } from '../../ui/notification/notification.component';
import { Subscription } from 'rxjs';
import { PlaceholderDirective } from '../directives';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private subscription!: Subscription;
  private alertHost!: PlaceholderDirective;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  public initHost(alertHost: PlaceholderDirective) {
    this.alertHost = alertHost;
  }

  public showNotification(message: string, type: string): void {
    const alertFactory = this.componentFactoryResolver.resolveComponentFactory(NotificationComponent);

    this.alertHost.viewContainerRef.clear();

    const component = this.alertHost.viewContainerRef.createComponent(alertFactory);

    component.instance.message = message;
    component.instance.type = type;

    this.subscription = component.instance.close.subscribe(() => {
      this.subscription.unsubscribe();
      this.alertHost.viewContainerRef.clear();
    });
  }
}
