import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TodoListComponent } from './pages/todo-list/todo-list.component';
import { FilterTodosPipe } from './core/pipes/filterTodos.pipe';

@NgModule({
  declarations: [
    AppComponent,
    TodoListComponent,
    FilterTodosPipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
