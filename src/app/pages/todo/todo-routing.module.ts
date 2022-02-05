import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TodoComponent } from './todo.component';
import { TodoWrapperComponent } from './pages/todo-wrapper/todo-wrapper.component';
import { CalendarComponent } from './pages/calendar/calendar.component';

const routes: Routes = [
  { path: '', component: TodoComponent, children: [
      { path: 'calendar', component: CalendarComponent },
      { path: ':date', component: TodoWrapperComponent }
    ] },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TodoRoutingModule {}
