import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    private fb: FormBuilder
    ) {}

  ngOnInit() {
    this.mode = this.route.snapshot.url[0].path;

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  public onSubmit(): void {
      console.log(this.form.value);

      this.router.navigate(['todo']);
  }
}
