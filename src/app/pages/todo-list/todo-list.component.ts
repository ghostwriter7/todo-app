import { Component, OnInit, Renderer2 } from '@angular/core';
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

  constructor(private renderer: Renderer2) {}

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

  public onDragEnter(todo: HTMLElement): void {
    this.renderer.setStyle(todo, 'opacity', 0.7);
  }

  public onDragLeave(todo: HTMLElement): void {
    this.renderer.setStyle(todo, 'opacity', 1);
  }

  public onDragStart(e: DragEvent): void {
    e.dataTransfer!.setData('initID', (<HTMLElement>e.target!).id);
    e.dataTransfer!.effectAllowed = 'move';
  }

  public onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
  }

  public onDrop(e: DragEvent, todo: HTMLElement): void {
    e.preventDefault();
    const draggedID = +e.dataTransfer!.getData('initID');
    const droppedID = +(e as any).toElement.getAttribute('id');
    this.renderer.setStyle(todo, 'opacity', 1);

    [this.mockup[draggedID], this.mockup[droppedID]] = [this.mockup[droppedID], this.mockup[draggedID]];
  }

  private countLeftTodos(): void {
    this.todosLeft = this.mockup.filter(todo => todo.isActive).length;
  }
}
