import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoRoutingModule } from './todo-routing.module';
import { TodoComponent } from './todo.component';
import { AddTodoComponent } from './pages/add-todo/add-todo.component';
import { TodoListComponent } from './pages/todo-list/todo-list.component';
import { TodoWrapperComponent } from './pages/todo-wrapper/todo-wrapper.component';
import { CalendarComponent } from './pages/calendar/calendar.component';

@NgModule({
  declarations: [
    AddTodoComponent,
    TodoListComponent,
    TodoComponent,
    TodoWrapperComponent,
    CalendarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TodoRoutingModule
  ],
  exports: []
})
export class TodoModule {}
