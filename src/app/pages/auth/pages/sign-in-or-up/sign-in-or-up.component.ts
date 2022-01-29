import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-sign-in-or-up',
  templateUrl: './sign-in-or-up.component.html',
  styleUrls: ['./sign-in-or-up.component.scss']
})
export class SignInOrUpComponent implements OnInit {
  public mode!: string;
  public form!: FormGroup;

  get controls() {
    return this.form.controls;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
    ) {}

  ngOnInit() {
    this.route.url.subscribe(url => {
      this.mode = url[0].path[0].toUpperCase() + url[0].path.slice(1);
    })

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  public onSubmit(): void {
      const { email, password } = this.form.value;

      let obs$: Observable<any>;

      obs$ = this.mode === 'Login' ? this.authService.login(email, password) : this.authService.signup(email, password);

      obs$.subscribe({
        next: () => {
          this.router.navigate(['/todo']);
          const message = this.mode === 'Login' ? "You've logged in successfully!" : "You've signed up successfully!";

          this.notificationService.showNotification(message, 'Success');
        },
        error: (err) => {
          return;
        }
      });
  }
}
