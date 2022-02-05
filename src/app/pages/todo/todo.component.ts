import { Component, OnInit } from '@angular/core';
import { TodoService } from './core/services/todo.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  templateUrl: 'todo.component.html'
})
export class TodoComponent implements OnInit {

  constructor(
    private todosService: TodoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.todosService.error$.subscribe((error) => {
      this.notificationService.showNotification(error, 'Error');
    });
  }
}
