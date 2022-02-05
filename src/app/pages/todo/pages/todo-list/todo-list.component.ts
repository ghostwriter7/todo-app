import { AfterContentInit, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ITodoItem } from '../../core/interfaces';
import { TodoService } from '../../core/services/todo.service';
import { combineLatest, Observable, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class TodoListComponent implements OnInit, AfterContentInit {
  public selectedTodoIdx: number | null = null;

  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    public todoService: TodoService
  ) {}

  ngOnInit(): void {

  }

  ngAfterContentInit(): void  {
    setTimeout(() => {
      const date = this.route.snapshot.params['date'];
      this.todoService.fetchTodos(date);
    }, 0);
  }

  public onDragEnter(todo: HTMLElement): void {
    this.renderer.setStyle(todo, 'opacity', 0.5);
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

    this.todoService.swapTodosOnList(draggedID, droppedID);
    this.selectedTodoIdx = droppedID;
  }
}
