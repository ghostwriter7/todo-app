import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ITodoItem } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  public mockup: ITodoItem[] = [
    {content: 'Prepare portfolio', isActive: true},
    {content: 'Cook breakfast', isActive: true},
    {content: 'Go for a hike', isActive: true},
    {content: 'Live to the fullest', isActive: true},
    {content: 'Have a cup of cocoa', isActive: true}
  ];

  public newTodo = new Subject<string>();
  public todosChanged = new BehaviorSubject<ITodoItem[]>(this.mockup);



  public getTodos(): Observable<ITodoItem[]> {
    return this.todosChanged.asObservable();
  }

  public deleteTodo(todo: ITodoItem): void {
    this.mockup = this.mockup.filter(item => item.content !== todo.content);
    this.todosChanged.next(this.mockup);
  }

  public toggleStatus(clickedTodo: ITodoItem): void {
    const todo = this.mockup.find(item => item.content === clickedTodo.content)!;

    todo.isActive = !todo.isActive;
    this.todosChanged.next(this.mockup);
  }

  public clearCompleted(): void {
    this.mockup = this.mockup.filter(todo => todo.isActive);
    this.todosChanged.next(this.mockup);
  }

  public addTodo(todo: string): void {
    this.mockup.unshift({ content: todo, isActive: true });
    this.todosChanged.next(this.mockup);
  }

  public saveInLocalStorage(): void {

  }
}
