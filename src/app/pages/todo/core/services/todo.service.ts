import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  finalize,
  map,
  Observable,
  ReplaySubject,
  Subject,
  switchMap,
  take, tap
} from 'rxjs';
import { ITodoItem } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../core/services/notification.service';
import { EventsService } from '../../../../core/services/events.service';
import {
  getFirestore,
  Firestore,
  where,
  DocumentReference,
} from 'firebase/firestore';
import { app } from '../../../../core/libs/firebase';
import { AuthService } from '../../../auth/core/services/auth.service';
import { CalendarService } from './calendar.service';
import { FirestoreService } from '../../../../core/services/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
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
    private readonly _http: HttpClient,
    private readonly _notificationService: NotificationService,
    private readonly _eventService: EventsService,
    private readonly _authService: AuthService,
    private readonly _calendarService: CalendarService,
    private readonly _firestoreService: FirestoreService
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

    this.todos.unshift({content: todo, isActive: true});

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

    const matchDate = where('date', '==', this.date);
    const matchCreator = where('creator', '==', this._authService.userSubject.getValue()!.id);

    this._firestoreService.getDocs('todos', matchDate, matchCreator)
    .pipe(finalize(() => this._eventService.stopLoading()))
    .subscribe((querySnapshot => {
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
    }));
  }

  private updateTodos(): void {
    this._eventService.startLoading();

    this._firestoreService.updateDoc(this.docRef!, {todos: this.todos})
    .pipe(
      switchMap(() =>
        this._calendarService.monthDocRef$.pipe(
          take(1),
          map((docRef) => docRef ? this.updateMonthlyDoc(docRef) : this.createMonthlyDoc())
        )),
      finalize(() => this._eventService.stopLoading())
    ).subscribe(() => {
      console.log('DATA UPDATED')
    }, (err) => {
      console.log('ERROR');
    });
  }

  private saveTodos(): void {
    this._eventService.startLoading();

    this._authService.user$.pipe(
      take(1),
      switchMap((user) => {
        return this._firestoreService.createDoc('todos',
          {
            todos: this.todos,
            date: this.date,
            creator: user!.id
          });
      }),
      tap((doc) => this.docRef = doc),
      switchMap(() => this._calendarService.monthDocRef$.pipe(
        take(1),
        switchMap(docRef => docRef ? this.updateMonthlyDoc(docRef) : this.createMonthlyDoc())
      )),
      finalize(() => this._eventService.stopLoading())
    ).subscribe(() => {
        this.mode = 'EDIT_TODOS';
      },
      (err) => {
        console.error('ERROR - TODO DOC', err);
      });
  }

  private deleteTodoDoc(): void {
    this._eventService.startLoading();

    this._firestoreService.deleteDoc(this.docRef!)
    .pipe(
      switchMap(() => this._calendarService.monthDocRef$.pipe(
        take(1),
        switchMap(docRef => this.updateMonthlyDoc(docRef!))
      )),
      finalize(() => this._eventService.stopLoading()))
    .subscribe(() => {
      this.mode = 'NEW_TODOS';
    });
  }

  private createMonthlyDoc(): Observable<any> {
    return combineLatest(
        [this._authService.user$,
        this._calendarService.currentMonth$,
        this._calendarService.currentYear$]
      ).pipe(
        tap(([user, month, year]) => console.log(user, month, year)),
        take(1),
        switchMap(([user, month, year]) => {
          const {day, total, completed} = this.prepareMonthlyUpdate();

          return this._firestoreService.createDoc('months', {
            creator: user!.id,
            month,
            year,
            [day]: {total, completed}
          }).pipe(tap(docRef => this._calendarService.monthDocSubject$.next(docRef)))
        })
    )
  }

  private updateMonthlyDoc(docRef: DocumentReference): Observable<any> {
    const {day, total, completed} = this.prepareMonthlyUpdate();

    return this._firestoreService.updateDoc(docRef,
      {[day]: {total, completed}});
  }

  private prepareMonthlyUpdate(): { day: string, total: number, completed: number } {
    let day = this.date.split('-')[0];
    day = day.startsWith('0') ? day[1] : day;

    const total = this.todos.length;
    const completed = this.todos.filter(todo => !todo.isActive).length;

    return {day, total, completed};
  }
}
