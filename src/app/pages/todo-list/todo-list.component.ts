import { Component } from '@angular/core';
import { ITodoItem } from '../../core/interfaces';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent {
  public mockup: ITodoItem[] = [
    { content: 'Prepare portfolio', isActive: true },
    { content: 'Cook breakfast', isActive: true },
    { content: 'Go for a hike', isActive: true },
    { content: 'Live to the fullest', isActive: true },
    { content: 'Have a cup of cocoa', isActive: false }
  ];

}
