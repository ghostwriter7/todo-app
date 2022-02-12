import { Injectable, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, finalize, from, ReplaySubject, Subject, switchMap, take } from 'rxjs';
import { ITodoItem } from '../interfaces';
import { PlaceholderDirective } from '../../../../core/directives/';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { EventsService } from '../../../../core/services/events.service';
import { getFirestore, Firestore, collection, addDoc, getDocs, query, where, DocumentReference, setDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../../../../core/libs/firebase';
import { AuthService } from '../../../auth/core/services/auth.service';
import { CalendarService } from './calendar.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  @ViewChild(PlaceholderDirective) alertHost!: PlaceholderDirective;
  private todosChanged = new ReplaySubject<ITodoItem[] | null>(1);
  public todos$ = this.todosChanged.asObservable();

  private errorEmitter = new Subject<string>();
  public error$ = this.errorEmitter.asObservable();

  private activeTodosSubject = new Subject<number>();
  public activeTodos$ = this.activeTodosSubject.asObservable();

  private filteringModeSubject = new BehaviorSubject<string>('All');
  public filteringMode$ = this.filteringModeSubject.asObservable();

  private currentPage = 0;
  private currentPageSubject = new BehaviorSubject<number>(this.currentPage);
  public currentPage$ = this.currentPageSubject.asObservable();

  private showNextButtonSubject = new BehaviorSubject<boolean>(false);
  public showNextButton$ = this.showNextButtonSubject.asObservable();

  private showPrevButtonSubject = new BehaviorSubject<boolean>(false);
  public showPrevButton$ = this.showPrevButtonSubject.asObservable();

  private dateSubject = new BehaviorSubject<Date>(new Date());
  public date$ = this.dateSubject.asObservable();

  private mode!: 'NEW_TODOS' | 'EDIT_TODOS';
  private date!: string;
  private docId?: string;
  private docRef?: DocumentReference;
  private todos: ITodoItem[] = [];

  private readonly db: Firestore;

  constructor(
    private _http: HttpClient,
    private _notificationService: NotificationService,
    private _eventService: EventsService,
    private _authService: AuthService,
    private _calendarService: CalendarService
  ) {
    this.db = getFirestore(app);
  }

  private checkButtons(): void {
    combineLatest(
      this.currentPage$,
      this.todos$
    ).pipe(take(1))
    .subscribe(([index, todos]) => {
      const isNextPage = todos ? (index + 1) * 5 < todos.length : false;
      const isPrevPage = todos ? index * 5 > 0 : false;

      this.showNextButtonSubject.next(isNextPage);
      this.showPrevButtonSubject.next(isPrevPage);
    });
  }

  public switchMode(mode: string): void {
    this.filteringModeSubject.next(mode);
    this.filterTodos();
    this.currentPageSubject.next(0);
    this.checkButtons();
  }

  public showNextPage(): void {
   this.currentPage++;
   this.currentPageSubject.next(this.currentPage);
   this.checkButtons();
  }

  public showPrevPage(): void {
    this.currentPage--;
    this.currentPageSubject.next(this.currentPage);
    this.checkButtons();
  }

  public enableClearCompleted(): boolean {
    if (!this.todos) {
      return false;
    }

    const completedTodos = this.todos.filter(todo => !todo.isActive);
    return !!completedTodos.length;
  }

  public filterTodos(): void {
    const filteredTodos = this.todos.filter(todo => {
      switch (this.filteringModeSubject.getValue()) {
        case 'Active':
          return todo.isActive;
        case 'Completed':
          return !todo.isActive;
        default:
          return todo;
      }
    });

    filteredTodos.length ? this.todosChanged.next(filteredTodos) : this.todosChanged.next(null);
  }

  public countActiveTodos() {
    this.activeTodosSubject.next(this.todos.filter(todo => todo.isActive).length);
  }

  public deleteTodo(todo: ITodoItem): void {
    this.todos = this.todos.filter(item => item.content !== todo.content);

    this.todos.length ? this.updateTodos() : this.deleteTodoDoc();

    this.filterTodos();
    this.countActiveTodos();
    this.checkButtons();
  }

  public swapTodosOnList(firstTodoID: number, secondTodoID: number): void {
    [this.todos[firstTodoID], this.todos[secondTodoID]] =
      [this.todos[secondTodoID], this.todos[firstTodoID]];

    this.updateTodos();
    this.filterTodos();
  }

  public toggleStatus(clickedTodo: ITodoItem): void {
    const todo = this.todos.find(item => item.content === clickedTodo.content)!;

    todo.isActive = !todo.isActive;

    this.filterTodos();
    this.updateTodos();
    this.countActiveTodos();
    this.checkButtons();
  }

  public clearCompleted(): void {
    this.todos = this.todos.filter(todo => todo.isActive);
    this.filterTodos();
    this.updateTodos();
    this.checkButtons();
  }

  public addTodo(todo: string): void {
    if (this.todos.find(item => item.content === todo)) {
      this.errorEmitter.next('Such a Todo already exists!');
      return;
    }

    this.todos.unshift({ content: todo, isActive: true });

    this.mode === 'NEW_TODOS' ? this.saveTodos() : this.updateTodos();

    this.filterTodos();
    this.countActiveTodos();
    this.checkButtons();
  }

  private initDate(date: string): void {
    this.date = date;
    const segments = date.split('-');

    this.dateSubject.next(new Date(+segments[2], +segments[1] - 1, +segments[0]));
  }

  public fetchTodos(date: string): void {
    this._eventService.startLoading();
    this.initDate(date);

    const matchDate =  where('date', '==', this.date);
    const matchCreator = where('creator', '==', this._authService.userSubject.getValue()!.id );

    const todosRef = collection(this.db, 'todos');
    const q = query(todosRef, matchDate, matchCreator);

    getDocs(q).then((querySnapshot) => {
      this.mode = querySnapshot.empty ? 'NEW_TODOS' : 'EDIT_TODOS';

      if (!querySnapshot.empty) {
        this.docId = querySnapshot.docs[0].id;
        this.docRef = querySnapshot.docs[0].ref;

        this.todos = (querySnapshot.docs[0].data() as any).todos;
      } else {
        this.todos = [];
      }

      this.filterTodos();
      this.countActiveTodos();
      this.checkButtons();
    }).finally(() => this._eventService.stopLoading());
  }

  private updateTodos(): void {
    this._eventService.startLoading();
    this.updateMonthlyData();

    setDoc(this.docRef!, { todos: this.todos }, { merge: true } )
      .then((res) => {
        console.log('TODO DOC UPDATED');
      })
      .catch(err => {
        console.error('ERROR: TODO DOC UPDATED', err);
      })
      .finally(() => this._eventService.stopLoading());
  }

  private saveTodos(): void {
    this._eventService.startLoading();
    this.updateMonthlyData();

      this._authService.user$.pipe(
        take(1),
        switchMap((user) => {
          return from(addDoc(collection(this.db, 'todos'), {
            todos: this.todos,
            date: this.date,
            creator: user!.id
          }));
        }),
        finalize(() => this._eventService.stopLoading())
      ).subscribe((doc) => {
          console.log('TODO DOC CREATED');
          this.mode = 'EDIT_TODOS';
      },
        (err) => {
        console.error('ERROR - TODO DOC', err);
        });
  }

  private deleteTodoDoc(): void {
    this._eventService.startLoading();
    this.updateMonthlyData();

    deleteDoc(this.docRef!)
      .then(() => {
        console.log('DOC DELETED!')
      })
      .catch(() => {
        console.log('ERR WHILE DELETING')
      })
      .finally(() => this._eventService.stopLoading());
  }

  private updateMonthlyData(): void {
    const docRef = this._calendarService.monthDocRef;
    let day = this.date.split('-')[0];
    day = day.startsWith('0') ? day[1] : day;
    const total = this.todos.length;
    const completed = this.todos.filter(todo => !todo.isActive).length;

    if (docRef) {
      setDoc(docRef, { [day]: { total, completed }}, { merge: true })
        .then((res) => {
          console.log('MONTH DATA UPDATED');
        })
        .catch((err) => {
          console.error('MONTH DATA UPDATE: ', err);
        })
    } else {
      combineLatest(
        this._authService.user$,
        this._calendarService.currentYear$,
        this._calendarService.currentMonth$
      ).subscribe(([user, year, month]) => {
        addDoc(collection(this.db, 'months'), {
          creator: user!.id,
          year,
          month,
          [day]: { total, completed }
        }).then((res) => {
          console.log('MONTH DATA CREATED');
        })
          .catch(err => {
            console.error('MONTH DATA CREATED: ', err);
          });
      });
    }
  }
}
