import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TodoListComponent } from './pages/todo-list/todo-list.component';
import { AddTodoComponent } from './pages/add-todo/add-todo.component';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './ui/header/header.component';
import { NotificationComponent } from './ui/notification/notification.component';
import { PlaceholderDirective } from './core/directives/placeholder.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    TodoListComponent,
    AddTodoComponent,
    HeaderComponent,
    NotificationComponent,
    PlaceholderDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
