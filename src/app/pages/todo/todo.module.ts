import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoRoutingModule } from './todo-routing.module';
import { TodoComponent } from './todo.component';
import { AddTodoComponent } from './pages/add-todo/add-todo.component';
import { TodoListComponent } from './pages/todo-list/todo-list.component';

@NgModule({
  declarations: [
    AddTodoComponent,
    TodoListComponent,
    TodoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TodoRoutingModule
  ],
  exports: [

  ]
})
export class TodoModule {}
