import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('showModal', [
      state('out', style({
        transform: 'translateX(200%)'
      })),
      state('in', style({
        transform: 'translateX(0)'
      })),
      transition('out <=> in', animate('.6s ease-in-out'))
    ])
  ]
})
export class NotificationComponent implements OnInit {
  @Input() message!: string;
  @Output() close = new EventEmitter<void>();

  public slideIn?: boolean;

  ngOnInit() {
    setTimeout(() => {
      this.slideIn = true;
    }, 0);
    setTimeout(() => {
      this.slideIn = false;
    }, 3300);
    setTimeout(() => {
      this.close.emit();
    }, 4000);
  }
}
