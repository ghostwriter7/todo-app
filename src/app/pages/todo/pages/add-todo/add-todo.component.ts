import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss']
})
export class AddTodoComponent implements OnInit {
  public newTodo = '';
  private date!: string;

  constructor(private todoService: TodoService,
              private _route: ActivatedRoute) {}

  ngOnInit(): void {
    this.date = this._route.snapshot.params['date'];
  }

  public onSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter' && this.newTodo) {
      this.todoService.addTodo(this.newTodo, this.date);
      this.newTodo = '';
    }
  }
}
