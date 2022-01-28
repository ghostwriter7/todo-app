import { NgModule } from '@angular/core';
import { AuthComponent } from './auth.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { SignInOrUpComponent } from './pages/sign-in-or-up/sign-in-or-up.component';

@NgModule({
  declarations: [
    AuthComponent,
    SignInOrUpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AuthRoutingModule,
    ReactiveFormsModule
  ],
  exports: []
})
export class AuthModule {}
