import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss']
})
export class AddTodoComponent implements OnInit {
  public newTodo = '';

  constructor(
    private todoService: TodoService,
  ) {}

  ngOnInit(): void {}

  public onSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter' && this.newTodo) {
      this.todoService.addTodo(this.newTodo);
      this.newTodo = '';
    }
  }
}
