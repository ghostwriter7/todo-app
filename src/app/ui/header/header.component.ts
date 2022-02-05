import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../../theme/theme.service';
import { TodoService } from '../../pages/todo/core/services/todo.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
    private _themeService: ThemeService,
    public todoService: TodoService
    ) {}

  ngOnInit(): void {
    this.todoService.date$.subscribe()

  }

  public onThemeToggle(): void {
    this._themeService.toggleTheme();
  }

}
