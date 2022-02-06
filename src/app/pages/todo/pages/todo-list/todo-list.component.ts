import { AfterContentInit, Component, Renderer2 } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class TodoListComponent implements AfterContentInit {
  public selectedTodoIdx: number | null = null;

  constructor(
    private _renderer: Renderer2,
    private _route: ActivatedRoute,
    public todoService: TodoService
  ) {}

  ngAfterContentInit(): void  {
    setTimeout(() => {
      this._route.params.subscribe((params: Params) => {
        const date = params['date'];
        this.todoService.fetchTodos(date);
      });
    }, 0);
  }

  public onDragEnter(todo: HTMLElement): void {
    this._renderer.setStyle(todo, 'opacity', 0.5);
  }

  public onDragLeave(todo: HTMLElement): void {
    this._renderer.setStyle(todo, 'opacity', 1);
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
    this._renderer.setStyle(todo, 'opacity', 1);

    this.todoService.swapTodosOnList(draggedID, droppedID);
    this.selectedTodoIdx = droppedID;
  }
}
