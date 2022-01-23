import { Component } from '@angular/core';
import { ITodoItem } from '../../core/interfaces';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent {
  public selectedTodoIdx: number | null = null;
  public checkedTodos: number[] = [];

  public mockup: ITodoItem[] = [
    { content: 'Prepare portfolio', isActive: true },
    { content: 'Cook breakfast', isActive: true },
    { content: 'Go for a hike', isActive: true },
    { content: 'Live to the fullest', isActive: true },
    { content: 'Have a cup of cocoa', isActive: false }
  ];

  public onDelete(i: number): void {
    this.mockup.splice(i, 1);
  }

  public onCheck(i: number): void {
    if (this.checkedTodos.find(item => item === i) !== undefined) {
      this.checkedTodos = this.checkedTodos.filter(todo => todo !== i);
    } else {
      this.checkedTodos.push(i);
    }
  }

  public isChecked(i: number): boolean {
    return this.checkedTodos.find(todo => todo === i) !== undefined;
  }
}
