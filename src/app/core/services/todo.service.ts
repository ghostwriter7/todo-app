import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ITodoItem } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  public mockup: ITodoItem[] = [];
  public todosChanged = new BehaviorSubject<ITodoItem[]>(this.mockup);

  public getTodos(): Observable<ITodoItem[]> {
    return this.todosChanged.asObservable();
  }

  public deleteTodo(todo: ITodoItem): void {
    this.mockup = this.mockup.filter(item => item.content !== todo.content);
    this.todosChanged.next(this.mockup);

    this.saveInLocalStorage();
  }

  public toggleStatus(clickedTodo: ITodoItem): void {
    const todo = this.mockup.find(item => item.content === clickedTodo.content)!;

    todo.isActive = !todo.isActive;
    this.todosChanged.next(this.mockup);

    this.saveInLocalStorage();
  }

  public clearCompleted(): void {
    this.mockup = this.mockup.filter(todo => todo.isActive);
    this.todosChanged.next(this.mockup);

    this.saveInLocalStorage();
  }

  public addTodo(todo: string): void {
    this.mockup.unshift({ content: todo, isActive: true });
    this.todosChanged.next(this.mockup);

    this.saveInLocalStorage();
  }

  public saveInLocalStorage(): void {
      localStorage.setItem('todos', JSON.stringify(this.mockup));
  }

  public loadTodosFromStorage(): void {
    const todos = localStorage.getItem('todos');

    if (todos) {
      this.mockup = JSON.parse(todos);
      this.todosChanged.next(this.mockup);
    }
  }
}
