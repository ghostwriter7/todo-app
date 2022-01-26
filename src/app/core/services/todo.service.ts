import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ITodoItem } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  public mockup: ITodoItem[] = [];

  private todosChanged = new BehaviorSubject<ITodoItem[]>(this.mockup);
  public todos$ = this.todosChanged.asObservable();

  private currentPage = 0;

  public getTodos(pageIndex: number, mode?: string) {
    this.currentPage = pageIndex;

    const curTodos = this.mockup.filter(todo => {
      if (mode) {
        switch (mode) {
          case 'Active':
            return todo.isActive;
          case 'Completed':
            return !todo.isActive;
          default:
            return todo;
        }
      } else {
        return todo;
      }
    }).slice(pageIndex * 5, pageIndex * 5 + 5);

    this.todosChanged.next(curTodos);
  }

  public countLeftTodos() {
    return this.mockup.filter(todo => todo.isActive).length;
  }

  public deleteTodo(todo: ITodoItem): void {
    this.mockup = this.mockup.filter(item => item.content !== todo.content);
    this.getTodos(this.currentPage);

    this.saveInLocalStorage();
  }

  public toggleStatus(clickedTodo: ITodoItem): void {
    const todo = this.mockup.find(item => item.content === clickedTodo.content)!;

    todo.isActive = !todo.isActive;

    this.getTodos(this.currentPage);

    this.saveInLocalStorage();
  }

  public clearCompleted(): void {
    this.mockup = this.mockup.filter(todo => todo.isActive);
    this.getTodos(this.currentPage);

    this.saveInLocalStorage();
  }

  public addTodo(todo: string): void {
    this.mockup.unshift({content: todo, isActive: true});
    this.getTodos(this.currentPage);

    this.saveInLocalStorage();
  }

  public saveInLocalStorage(): void {
    localStorage.setItem('todos', JSON.stringify(this.mockup));
  }

  public loadTodosFromStorage(): void {
    const todos = localStorage.getItem('todos');

    if (todos) {
      this.mockup = JSON.parse(todos);
      this.getTodos(this.currentPage);
    }
  }
}
