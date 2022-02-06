import { Injectable, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, ReplaySubject, Subject, take } from 'rxjs';
import { ITodoItem, ITodoResponse } from '../interfaces';
import { PlaceholderDirective } from '../../../../core/directives/';
import { StorageService } from '../../../../core/services/storage.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { EventsService } from '../../../../core/services/events.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  @ViewChild(PlaceholderDirective) alertHost!: PlaceholderDirective;
  private baseURL = 'https://todo-app-api-pb8f2a9vn-ghostwriter7.vercel.app/api/todo';

  private todosChanged = new ReplaySubject<ITodoItem[] | null>(1);
  public todos$ = this.todosChanged.asObservable();

  private errorEmitter = new Subject<string>();
  public error$ = this.errorEmitter.asObservable();

  private activeTodosSubject = new Subject<number>();
  public activeTodos$ = this.activeTodosSubject.asObservable();

  private filteringModeSubject = new BehaviorSubject<string>('All');
  public filteringMode$ = this.filteringModeSubject.asObservable();

  private currentPage = 0;
  private currentPageSubject = new BehaviorSubject<number>(this.currentPage);
  public currentPage$ = this.currentPageSubject.asObservable();

  private showNextButtonSubject = new BehaviorSubject<boolean>(false);
  public showNextButton$ = this.showNextButtonSubject.asObservable();

  private showPrevButtonSubject = new BehaviorSubject<boolean>(false);
  public showPrevButton$ = this.showPrevButtonSubject.asObservable();

  private dateSubject = new BehaviorSubject<Date>(new Date());
  public date$ = this.dateSubject.asObservable();

  private mode!: 'NEW_TODOS' | 'EDIT_TODOS';
  private date!: string;
  private doc: ITodoResponse = {
    creator: '',
    _id: '',
    date: '',
    todos: []
  };

  constructor(
    private _http: HttpClient,
    private _notificationService: NotificationService,
    private _eventService: EventsService
  ) {}

  private checkButtons(): void {
    combineLatest(
      this.currentPage$,
      this.todos$
    ).pipe(take(1))
    .subscribe(([index, todos]) => {
      const isNextPage = todos ? (index + 1) * 5 < todos.length : false;
      const isPrevPage = todos ? index * 5 > 0 : false;

      this.showNextButtonSubject.next(isNextPage);
      this.showPrevButtonSubject.next(isPrevPage);
    });
  }

  public switchMode(mode: string): void {
    this.filteringModeSubject.next(mode);
    this.filterTodos();
    this.currentPageSubject.next(0);
    this.checkButtons();
  }

  public showNextPage(): void {
   this.currentPage++;
   this.currentPageSubject.next(this.currentPage);
   this.checkButtons();
  }

  public showPrevPage(): void {
    this.currentPage--;
    this.currentPageSubject.next(this.currentPage);
    this.checkButtons();
  }

  public enableClearCompleted(): boolean {
    if (!this.doc.todos) {
      return false;
    }

    const completedTodos = this.doc.todos.filter(todo => !todo.isActive);
    return !!completedTodos.length;
  }

  public filterTodos(): void {
    const filteredTodos = this.doc.todos.filter(todo => {
      switch (this.filteringModeSubject.getValue()) {
        case 'Active':
          return todo.isActive;
        case 'Completed':
          return !todo.isActive;
        default:
          return todo;
      }
    });

    filteredTodos.length ? this.todosChanged.next(filteredTodos) : this.todosChanged.next(null);
  }

  public countActiveTodos() {
    this.activeTodosSubject.next(this.doc.todos.filter(todo => todo.isActive).length);
  }

  public deleteTodo(todo: ITodoItem): void {
    this.doc.todos = this.doc.todos.filter(item => item.content !== todo.content);

    this.doc.todos.length ? this.updateTodos() : this.deleteTodoDoc();

    this.filterTodos();
    this.countActiveTodos();
    this.checkButtons();
  }

  public swapTodosOnList(firstTodoID: number, secondTodoID: number): void {
    [this.doc.todos[firstTodoID], this.doc.todos[secondTodoID]] =
      [this.doc.todos[secondTodoID], this.doc.todos[firstTodoID]];

    this.updateTodos();
    this.filterTodos();
  }

  public toggleStatus(clickedTodo: ITodoItem): void {
    const todo = this.doc.todos.find(item => item.content === clickedTodo.content)!;

    todo.isActive = !todo.isActive;

    this.filterTodos();
    this.updateTodos();
    this.countActiveTodos();
    this.checkButtons();
  }

  public clearCompleted(): void {
    this.doc.todos = this.doc.todos.filter(todo => todo.isActive);
    this.filterTodos();
    this.updateTodos();
    this.checkButtons();
  }

  public addTodo(todo: string): void {
    if (this.doc.todos.find(item => item.content === todo)) {
      this.errorEmitter.next('Such a Todo already exists!');
      return;
    }

    this.doc.todos.unshift({ content: todo, isActive: true });

    this.mode === 'NEW_TODOS' ? this.saveTodos() : this.updateTodos();
    this.filterTodos();
    this.countActiveTodos();
    this.checkButtons();
  }

  private initDate(date: string): void {
    this.date = date;
    const segments = date.split('-');

    this.dateSubject.next(new Date(+segments[2], +segments[1] - 1, +segments[0]));
  }

  public fetchTodos(date: string): void {
    this._eventService.startLoading();
    this.initDate(date);

    this._http.get<{ doc: ITodoResponse }>(`${this.baseURL}/${date}`)
    .subscribe({
      next: (res) => {
        this.mode = 'EDIT_TODOS';
        this.doc = res.doc;
        this._eventService.stopLoading();

        this.filterTodos();
        this.countActiveTodos();
        this.checkButtons();
      },
      error: (err) => {
        this.doc = {
          _id: '',
          creator: '',
          todos: [],
          date: this.date
        };

        this._eventService.stopLoading();
        this.filterTodos();
        this._notificationService.showNotification(err.error.message, 'Info');
        this.mode = 'NEW_TODOS';
      }
    });
  }

  private updateTodos(): void {
    this._http.put<{ message: string }>(`${this.baseURL}/${this.date}`, this.doc)
    .subscribe({
      next: (res) => {
        this.mode = 'EDIT_TODOS';
        this._notificationService.showNotification(res.message, 'Success');
      },
      error: (err) => {
        this._notificationService.showNotification(err.error.message, 'Error');
      }
    });
  }

  private saveTodos(): void {
    this._http.post<{ doc: ITodoResponse}>(`${this.baseURL}/${this.date}`, this.doc.todos)
    .subscribe({
      next: (res) => {
        this.mode = 'EDIT_TODOS';
        this.doc = res.doc;
      },
      error: (err) => {
        this._notificationService.showNotification(err.error.message, 'Error');
      }
    });
  }

  private deleteTodoDoc(): void {
    this._http.delete(`${this.baseURL}/${this.date}`).subscribe({
      next: () => {
        this.mode = 'NEW_TODOS';
      }
    });
  }
}
