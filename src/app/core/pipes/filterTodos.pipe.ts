import { Pipe, PipeTransform } from '@angular/core';
import { ITodoItem } from '../interfaces';
import { TodoService } from '../services/todo.service';

@Pipe({
  name: 'filterTodos'
})
export class FilterTodosPipe implements PipeTransform {
  constructor(private todosService: TodoService) {}

  transform(value: ITodoItem[] | null, mode: 'All' | 'Active' | 'Completed', currentPage: number): any {
    this.todosService.getTodos(currentPage);

    if (!value) {
      return;
    }

    switch (mode) {
      case 'All': {
        return value;
      }
      case 'Active': {
        return value.filter(todo => todo.isActive);
      }
      case 'Completed': {
        return value.filter(todo => !todo.isActive);
      }
    }
  }
}
