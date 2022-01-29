import { Injectable, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ITodoItem } from '../interfaces';
import { PlaceholderDirective } from '../../../../core/directives/';
import { StorageService } from '../../../../core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  @ViewChild(PlaceholderDirective) alertHost!: PlaceholderDirective;
  public mockup: ITodoItem[] = [];

  private todosChanged = new BehaviorSubject<ITodoItem[]>(this.mockup);
  private errorEmitter = new Subject<string>();
  public todos$ = this.todosChanged.asObservable();
  public error$ = this.errorEmitter.asObservable();

  private currentPage = 0;

  get completed(): number {
    return this.mockup.filter(todo => !todo.isActive).length;
  }

  constructor(private storageService: StorageService) {}

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

  public countLeftTodos(): number {
    return this.mockup.filter(todo => todo.isActive).length;
  }

  public countTodosForBtn(mode: string): number {
    switch (mode) {
      case 'Active': {
        return this.countLeftTodos();
      }
      case 'Completed': {
        return this.mockup.filter(todo => !todo.isActive).length;
      }
      default: {
        return this.mockup.length;
      }
    }
  }

  public deleteTodo(todo: ITodoItem): void {
    this.mockup = this.mockup.filter(item => item.content !== todo.content);
    this.getTodos(this.currentPage);

    this.saveInLocalStorage();
  }

  public toggleStatus(clickedTodo: ITodoItem, mode: string): void {
    const todo = this.mockup.find(item => item.content === clickedTodo.content)!;

    todo.isActive = !todo.isActive;

    this.getTodos(this.currentPage, mode);

    this.saveInLocalStorage();
  }

  public clearCompleted(): void {
    this.mockup = this.mockup.filter(todo => todo.isActive);
    this.getTodos(this.currentPage);

    this.saveInLocalStorage();
  }

  public addTodo(todo: string): void {
    if (this.mockup.find(item => item.content === todo)) {
      this.errorEmitter.next('Such a Todo already exists!');
      return;
    }

    this.mockup.unshift({ content: todo, isActive: true });
    this.getTodos(this.currentPage);

    this.saveInLocalStorage();
  }

  public saveInLocalStorage(): void {
    this.storageService.saveItem('todos', this.mockup);
  }

  public loadTodosFromStorage(): void {
    const todos = this.storageService.getItem('todos');

    if (todos) {
      this.mockup = this.storageService.parseItem(todos);
      this.getTodos(this.currentPage);
    }
  }
}
