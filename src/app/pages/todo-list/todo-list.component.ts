import { Component, OnInit } from '@angular/core';
import { ITodoItem } from '../../core/interfaces';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class TodoListComponent implements OnInit {
  public selectedTodoIdx: number | null = null;
  public filteringMode: 'All' | 'Active' | 'Completed' = 'All';
  public todosLeft?: number;

  public mockup: ITodoItem[] = [
    {content: 'Prepare portfolio', isActive: true},
    {content: 'Cook breakfast', isActive: true},
    {content: 'Go for a hike', isActive: true},
    {content: 'Live to the fullest', isActive: true},
    {content: 'Have a cup of cocoa', isActive: true}
  ];

  ngOnInit(): void {
    this.countLeftTodos();
  }

  public onDelete(i: number): void {
    this.mockup.splice(i, 1);
    this.countLeftTodos();
  }

  public onCheck(clickedTodo: ITodoItem): void {
    const todo = this.mockup.find(item => item.content === clickedTodo.content)!;

    todo.isActive = !todo.isActive;

    this.countLeftTodos();
  }

  public onClearCompleted(): void {
    this.filteringMode = 'All';
    this.mockup = this.mockup.filter(todo => todo.isActive);
    this.countLeftTodos();
  }

  private countLeftTodos(): void {
    this.todosLeft = this.mockup.filter(todo => todo.isActive).length;
  }
}
