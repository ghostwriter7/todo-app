import { Component } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss']
})
export class AddTodoComponent {
  public newTodo = '';

  constructor(private todoService: TodoService) {}

  public onSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter' && this.newTodo) {
      this.todoService.addTodo(this.newTodo);
      this.newTodo = '';
    }
  }
}
