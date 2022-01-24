import { Component, OnInit } from '@angular/core';
import { TodoService } from './core/services/todo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private todosService: TodoService) {}

  ngOnInit(): void {
    this.todosService.loadTodosFromStorage();
  }
}
