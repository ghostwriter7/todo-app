import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ITodoItem } from '../../core/interfaces';
import { TodoService } from '../../core/services/todo.service';
import { Subscription } from 'rxjs';
import { PlaceholderDirective } from '../../core/directives/placeholder.directive';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class TodoListComponent implements OnInit, OnDestroy {
  public selectedTodoIdx: number | null = null;
  public filteringMode = 'All';
  public todosLeft?: number;
  public currentPage = 0;
  public anyTodosOnList?: boolean;
  public mockup: ITodoItem[] = [];

  private todosSub!: Subscription;
  private newTodoSub!: Subscription;

  constructor(
    private renderer: Renderer2,
    private todoService: TodoService
  ) {}

  ngOnInit(): void {
    this.todosSub = this.todoService.todos$.subscribe(todos => {
      this.mockup = todos;

      this.anyTodosOnList = !!this.mockup.length;
      this.todosLeft = this.todoService.countLeftTodos();
    });

    this.todoService.getTodos(this.currentPage);
  }

  public onDelete(item: ITodoItem): void {
    this.todoService.deleteTodo(item);
  }

  public onToggleStatus(clickedTodo: ITodoItem): void {
    this.todoService.toggleStatus(clickedTodo, this.filteringMode);
  }

  public onClearCompleted(): void {
    this.filteringMode = 'All';
    this.todoService.clearCompleted();
  }

  public onChangeMode(mode: string) {
    this.filteringMode = mode;
    this.todoService.getTodos(this.currentPage, mode);
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

    [this.mockup[draggedID], this.mockup[droppedID]] = [this.mockup[droppedID], this.mockup[draggedID]];
  }

  public onNextPage(): void {
    this.currentPage++;
    this.todoService.getTodos(this.currentPage, this.filteringMode);
  }

  public onPrevPage(): void {
    this.currentPage--;
    this.todoService.getTodos(this.currentPage, this.filteringMode);
  }

  ngOnDestroy(): void {
    this.todosSub.unsubscribe();
    this.newTodoSub.unsubscribe();
  }
}
