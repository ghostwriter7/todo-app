import { Pipe, PipeTransform } from '@angular/core';
import { ITodoItem } from '../interfaces';

@Pipe({
  name: 'filterTodos'
})
export class FilterTodosPipe implements PipeTransform {
  transform(value: ITodoItem[] | null, mode: 'All' | 'Active' | 'Completed'): any {
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
